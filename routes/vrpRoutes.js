// server/routes/vrpRoutes.js

import express from 'express';
// Assuming getDistanceMatrix and getDetailedRoutePath are in services/distanceMatrixService.js
import { getDistanceMatrix, getDetailedRoutePath } from '../services/distanceMatrixService.js';
import { solveVRP } from '../services/vrpSolver.js'; // CHANGED: Correct import for ES Module named export

const router = express.Router();

// POST /api/vrp/optimize
router.post('/optimize', async (req, res) => {
    try {
        const { departure_location, clients, num_vehicles } = req.body;

        // --- Step 1: Input Validation ---
        console.log('[VrpRoutes] Received VRP request with data:', { departure_location, clientsCount: clients ? clients.length : 0, num_vehicles });

        if (!departure_location || !Array.isArray(departure_location) || departure_location.length !== 2 ||
            typeof departure_location[0] !== 'number' || typeof departure_location[1] !== 'number') {
            console.error('[VrpRoutes] Validation Error: Invalid departure_location format or value.');
            return res.status(400).json({ message: 'Invalid departure location: Must be an array of two numbers [lat, lng].' });
        }

        const parsedNumVehicles = parseInt(num_vehicles, 10);
        if (isNaN(parsedNumVehicles) || parsedNumVehicles <= 0) {
            console.error('[VrpRoutes] Validation Error: Invalid number of vehicles.');
            return res.status(400).json({ message: 'Number of vehicles must be a positive integer.' });
        }

        if (!clients || !Array.isArray(clients) || clients.length === 0) {
            console.warn('[VrpRoutes] No clients provided. Returning basic routes from depot.');
            const emptyRoutes = [];
            for (let i = 0; i < parsedNumVehicles; i++) {
                emptyRoutes.push({
                    vehicle_id: `v${i + 1}`,
                    stops: [departure_location],
                    path: [departure_location],
                    distance: 0,
                    duration: 0,
                    clients_served: []
                });
            }
            return res.json({ message: 'Optimization successful (no clients provided)', optimized_routes: emptyRoutes });
        }

        for (const client of clients) {
            if (!client.id || !client.location || !Array.isArray(client.location) || client.location.length !== 2 ||
                typeof client.location[0] !== 'number' || typeof client.location[1] !== 'number' ||
                typeof client.demand !== 'number' || client.demand <= 0) {
                console.error('[VrpRoutes] Validation Error: Invalid client data format or missing fields for client:', client);
                return res.status(400).json({ message: `Invalid client data: Each client must have id, location [lat, lng] (numbers), and a positive demand.` });
            }
        }

        console.log('[VrpRoutes] Starting VRP optimization process...');

        // --- Step 2: Get Distance/Duration Matrix from OSRM ---
        const allLocations = [
            { lat: departure_location[0], lng: departure_location[1] },
            ...clients.map(c => ({ lat: c.location[0], lng: c.location[1] }))
        ];
        console.log(`[VrpRoutes] Fetching distance matrix for ${allLocations.length} locations...`);
        const { distances, durations } = await getDistanceMatrix(allLocations);
        console.log('[VrpRoutes] Distance Matrix received. Example distances (first row):', distances ? distances[0].slice(0, Math.min(5, distances[0].length)) : 'N/A');
        console.log('[VrpRoutes] Duration Matrix received. Example durations (first row):', durations ? durations[0].slice(0, Math.min(5, durations[0].length)) : 'N/A');

        if (!distances || distances.length === 0 || !durations || durations.length === 0 || distances[0].length !== allLocations.length) {
            console.error('[VrpRoutes] OSRM returned empty or incomplete distance/duration matrices.');
            return res.status(500).json({ message: 'Failed to get complete routing data from OSRM service. Check OSRM server status or input coordinates.' });
        }

        // --- Step 3: Prepare data for Python VRP Solver ---
        const vrpDataForPython = {
            departure_location: departure_location,
            clients: clients,
            num_vehicles: parsedNumVehicles,
            distance_matrix: distances,
            duration_matrix: durations,
            // You might want to add vehicle_capacities here if your Python solver uses them
            // vehicle_capacities: vehicleCapacitiesArray // example
        };

        console.log('[VrpRoutes] Calling Python VRP solver...');
        // CHANGED: Call the function directly as solveVRP
        const pythonSolverResult = await solveVRP(vrpDataForPython);
        console.log('[VrpRoutes] Python VRP solver raw result:', JSON.stringify(pythonSolverResult, null, 2));

        let optimized_routes_with_paths = [];

        if (pythonSolverResult && Array.isArray(pythonSolverResult.optimized_routes)) {
            // --- Step 4: Process VRP Solver Output and Get Detailed Paths ---
            // Use Promise.all to fetch detailed paths in parallel for each route
            optimized_routes_with_paths = await Promise.all(
                pythonSolverResult.optimized_routes.map(async (route) => {
                    if (!route.stops_indices || !Array.isArray(route.stops_indices) || route.stops_indices.length < 1) {
                        console.warn(`[VrpRoutes] Route for vehicle ${route.vehicle_id} has invalid 'stops_indices'. Skipping.`);
                        return { ...route, path: [], distance: 0, duration: 0 }; // Return empty path if invalid
                    }

                    // Map indices back to actual coordinates (depot + clients)
                    const routeCoordinates = route.stops_indices.map(index => {
                        if (index >= 0 && index < allLocations.length) {
                            const loc = allLocations[index];
                            return [loc.lat, loc.lng];
                        } else {
                            console.warn(`[VrpRoutes] Invalid index ${index} found in route for vehicle ${route.vehicle_id}. This index might not correspond to a valid location in 'allLocations'.`);
                            return null;
                        }
                    }).filter(coord => coord !== null); // Filter out any nulls if an index was invalid

                    let detailedPathInfo = { path: [], distance: 0, duration: 0 };
                    if (routeCoordinates.length > 1) {
                        try {
                            // Get detailed polyline path, distance, and duration from OSRM for the whole route
                            detailedPathInfo = await getDetailedRoutePath(routeCoordinates);
                        } catch (pathError) {
                            console.warn(`[VrpRoutes] Could not get detailed path for vehicle ${route.vehicle_id} from OSRM: ${pathError.message}. Using direct coordinates as path and solver's distance/duration.`);
                            detailedPathInfo.path = routeCoordinates; // Fallback: use direct segment points as path
                            detailedPathInfo.distance = route.distance || 0; // Fallback to solver's total distance
                            detailedPathInfo.duration = route.duration || 0; // Fallback to solver's total duration
                        }
                    } else if (routeCoordinates.length === 1) {
                        // If only one stop (e.g., depot only route or single client route), path is just that point
                        detailedPathInfo.path = routeCoordinates;
                        detailedPathInfo.distance = 0;
                        detailedPathInfo.duration = 0;
                    }
                    
                    // Map client indices back to original client IDs for display/tracking
                    const clientsServedByRoute = route.stops_indices
                                         .filter(idx => idx > 0) // Exclude depot (index 0)
                                         .map(idx => {
                                             // Client indices in the Python solver output are 1-based relative to the 'clients' array
                                             // So, client at index `i` in `clients` array corresponds to `i+1` in `allLocations` and `stops_indices`
                                             if (idx - 1 >= 0 && idx - 1 < clients.length) {
                                                 return clients[idx - 1].id; // Map back to original client ID
                                             }
                                             return null; // Should not happen if indices are correct
                                         }).filter(id => id !== null); // Remove any nulls if client ID was not found

                    return {
                        vehicle_id: route.vehicle_id,
                        stops: routeCoordinates, // The sequence of lat/lon coordinates to visit (including depot)
                        path: detailedPathInfo.path, // Detailed polyline for map display from OSRM
                        distance: (detailedPathInfo.distance > 0 && detailedPathInfo.path.length > 1) ? detailedPathInfo.distance : (route.distance || 0), // Prefer OSRM distance if available
                        duration: (detailedPathInfo.duration > 0 && detailedPathInfo.path.length > 1) ? detailedPathInfo.duration : (route.duration || 0), // Prefer OSRM duration if available
                        clients_served: clientsServedByRoute // List of client IDs served by this route
                    };
                })
            );
        } else {
            console.error("[VrpRoutes] Python solver result did not contain 'optimized_routes' array or it was empty/invalid.");
            return res.status(500).json({ message: 'VRP solver could not find optimized routes or returned an unexpected format.' });
        }

        // --- Start of modification for desired console output (as requested previously) ---
        // This part just logs the first route's details to the console.
        if (optimized_routes_with_paths.length > 0) {
            const firstRoute = optimized_routes_with_paths[0];
            // Build the itinerary string: Depot -> Client ID1 -> Client ID2 -> Depot
            const itineraryStops = ['Dépôt', ...(firstRoute.clients_served ? firstRoute.clients_served.map(id => `Client ${id}`) : []), 'Dépôt'];
            const itinerary = itineraryStops.join(' -> ');

            // Prepare route details for console (segment by segment distance)
            const routeDetails = [];
            for (let i = 0; i < firstRoute.stops.length - 1; i++) {
                const fromCoord = firstRoute.stops[i];
                const toCoord = firstRoute.stops[i+1];
                
                // Find the indices of these two coordinates in allLocations to get their distance from the distance matrix.
                const fromIndex = allLocations.findIndex(loc => loc.lat === fromCoord[0] && loc.lng === fromCoord[1]);
                const toIndex = allLocations.findIndex(loc => loc.lat === toCoord[0] && loc.lng === toCoord[1]);
                
                let segmentDistance = 0;
                if (fromIndex !== -1 && toIndex !== -1 && distances && distances[fromIndex] && distances[fromIndex][toIndex] !== undefined) {
                    segmentDistance = distances[fromIndex][toIndex] / 1000; // Convert meters to kilometers
                } else {
                     console.warn(`[VrpRoutes] Could not find distance between ${fromCoord} and ${toCoord} in matrix.`);
                }

                routeDetails.push({
                    from: itineraryStops[i],
                    to: itineraryStops[i+1],
                    distance: `${segmentDistance.toFixed(2)} km`
                });
            }

            const formattedFirstRoute = {
                vehicle_id: firstRoute.vehicle_id,
                totalDistance: `${(firstRoute.distance / 1000).toFixed(2)} km`, // Convert meters to kilometers
                itinerary: itinerary,
                routeDetails: routeDetails
            };
            console.log('[VrpRoutes] VRP optimization completed. Sending formatted routes (example for first vehicle):', formattedFirstRoute);
        } else {
            console.log('[VrpRoutes] VRP optimization completed. No routes generated.');
        }
        // --- End of modification ---

        res.json({ message: 'Optimization successful', optimized_routes: optimized_routes_with_paths });

    } catch (error) {
        console.error('[VrpRoutes] Error in VRP optimization endpoint:', error);
        res.status(500).json({
            message: 'Internal server error during route optimization.',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;