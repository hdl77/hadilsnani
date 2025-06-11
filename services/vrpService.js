// server/services/vrpService.js
// Renamed from vrpRoutes.js to reflect its new role as a service

import { getDistanceMatrix, getDetailedRoutePath } from './distanceMatrixService.js'; // Assuming this service exists
import { solveVRP } from './vrpSolver.js'; // Assuming this service exists and calls Python

// This function will be called by calculeTonnage.js
export async function solveVRPService(departure_location, clients, num_vehicles, vehicle_capacities) { // Added vehicle_capacities
    console.log('[VrpService] Received VRP request for optimization:', { departure_location, clientsCount: clients.length, num_vehicles, vehicle_capacities_count: vehicle_capacities.length });

    // --- Step 1: Input Validation (simplified as primary validation is in calculeTonnage.js) ---
    if (!departure_location || !Array.isArray(departure_location) || departure_location.length !== 2) {
        throw new Error('Invalid departure location: Must be an array of two numbers [lat, lng].');
    }
    const parsedNumVehicles = parseInt(num_vehicles, 10);
    if (isNaN(parsedNumVehicles) || parsedNumVehicles <= 0) {
        throw new Error('Number of vehicles must be a positive integer.');
    }
    if (!clients || !Array.isArray(clients) || clients.length === 0) {
        // If no clients, return empty routes immediately
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
        return { optimized_routes: emptyRoutes };
    }

    for (const client of clients) {
        if (!client.id || !client.location || !Array.isArray(client.location) || client.location.length !== 2 ||
            typeof client.location[0] !== 'number' || typeof client.location[1] !== 'number' ||
            typeof client.demand !== 'number' || client.demand <= 0) {
            throw new Error(`Invalid client data: Each client must have id, location [lat, lng] (numbers), and a positive demand.`);
        }
    }
    if (!vehicle_capacities || !Array.isArray(vehicle_capacities) || vehicle_capacities.length !== parsedNumVehicles) {
        throw new Error('Vehicle capacities array must be provided and match the number of vehicles.');
    }

    console.log('[VrpService] Starting VRP optimization process...');

    // --- Step 2: Get Distance/Duration Matrix from OSRM ---
    const allLocations = [
        { lat: departure_location[0], lng: departure_location[1] },
        ...clients.map(c => ({ lat: c.location[0], lng: c.location[1] }))
    ];
    console.log(`[VrpService] Fetching distance matrix for ${allLocations.length} locations...`);
    const { distances, durations } = await getDistanceMatrix(allLocations);
    console.log('[VrpService] Distance Matrix received. Example distances (first row):', distances ? distances[0].slice(0, Math.min(5, distances[0].length)) : 'N/A');
    console.log('[VrpService] Duration Matrix received. Example durations (first row):', durations ? durations[0].slice(0, Math.min(5, durations[0].length)) : 'N/A');

    if (!distances || distances.length === 0 || !durations || durations.length === 0 || distances[0].length !== allLocations.length) {
        throw new Error('Failed to get complete routing data from OSRM service. Check OSRM server status or input coordinates.');
    }

    // --- Step 3: Prepare data for Python VRP Solver ---
    const vrpDataForPython = {
        departure_location: departure_location,
        clients: clients,
        num_vehicles: parsedNumVehicles,
        distance_matrix: distances,
        duration_matrix: durations,
        vehicle_capacities: vehicle_capacities, // Pass individual vehicle capacities
    };

    console.log('[VrpService] Calling Python VRP solver...');
    const pythonSolverResult = await solveVRP(vrpDataForPython); // This is the solveVRP from your vrpSolver.js
    console.log('[VrpService] Python VRP solver raw result:', JSON.stringify(pythonSolverResult, null, 2));

    let optimized_routes_with_paths = [];

    if (pythonSolverResult && Array.isArray(pythonSolverResult.optimized_routes)) {
        for (const route of pythonSolverResult.optimized_routes) {
            if (!route.stops_indices || !Array.isArray(route.stops_indices) || route.stops_indices.length < 1) {
                console.warn(`[VrpService] Route for vehicle ${route.vehicle_id} has invalid 'stops_indices'. Skipping.`);
                continue;
            }

            const routeCoordinates = route.stops_indices.map(index => {
                if (index >= 0 && index < allLocations.length) {
                    const loc = allLocations[index];
                    return [loc.lat, loc.lng];
                } else {
                    console.warn(`[VrpService] Invalid index ${index} found in route for vehicle ${route.vehicle_id}. This index might not correspond to a valid location in 'allLocations'.`);
                    return null;
                }
            }).filter(coord => coord !== null);

            // --- Step 5: Get Detailed Path for Each Route from OSRM ---
            let detailedPathInfo = { path: [], distance: 0, duration: 0 };
            if (routeCoordinates.length > 1) {
                try {
                    detailedPathInfo = await getDetailedRoutePath(routeCoordinates);
                } catch (pathError) {
                    console.warn(`[VrpService] Could not get detailed path for vehicle ${route.vehicle_id} from OSRM: ${pathError.message}. Using direct coordinates as path and solver's distance/duration.`);
                    detailedPathInfo.path = routeCoordinates;
                    detailedPathInfo.distance = route.distance || 0;
                    detailedPathInfo.duration = route.duration || 0;
                }
            } else if (routeCoordinates.length === 1) {
                detailedPathInfo.path = routeCoordinates;
                detailedPathInfo.distance = 0;
                detailedPathInfo.duration = 0;
            }
            
            const clientsServedByRoute = route.stops_indices
                                 .filter(idx => idx > 0) // Exclude depot (index 0)
                                 .map(idx => {
                                     // Adjust index to match clients array (which starts at 0, while allLocations has depot at 0)
                                     if (idx - 1 >= 0 && idx - 1 < clients.length) {
                                         return clients[idx - 1].id;
                                     }
                                     return null;
                                 }).filter(id => id !== null);

            optimized_routes_with_paths.push({
                vehicle_id: route.vehicle_id,
                stops: routeCoordinates,
                path: detailedPathInfo.path,
                distance: (detailedPathInfo.distance > 0 && detailedPathInfo.path.length > 1) ? detailedPathInfo.distance : (route.distance || 0),
                duration: (detailedPathInfo.duration > 0 && detailedPathInfo.path.length > 1) ? detailedPathInfo.duration : (route.duration || 0),
                clients_served: clientsServedByRoute
            });
        }
    } else {
        console.error("[VrpService] Python solver result did not contain 'optimized_routes' array or it was empty/invalid.");
        throw new Error('VRP solver could not find optimized routes or returned an unexpected format.');
    }

    // --- Start of modification for desired console output (can be removed for production) ---
    if (optimized_routes_with_paths.length > 0) {
        const firstRoute = optimized_routes_with_paths[0];
        // Ensure client IDs are properly mapped to names if needed, or just use raw IDs
        const itineraryStops = ['Dépôt', ...firstRoute.clients_served.map(id => `Client ${id}`), 'Dépôt'];
        const itinerary = itineraryStops.join(' -> ');

        const routeDetails = [];
        // The detailedPathInfo.path should be used for route details as it contains actual segment points
        // The current logic here uses allLocations which is less granular.
        // For accurate segment distances, you'd need to iterate through detailedPathInfo.path and query OSRM for each segment.
        // For simplicity and matching current approach, we'll keep using matrix but highlight it's approximate.
        for (let i = 0; i < firstRoute.stops.length - 1; i++) {
            const fromCoord = firstRoute.stops[i];
            const toCoord = firstRoute.stops[i+1];
            
            const fromIndex = allLocations.findIndex(loc => loc.lat === fromCoord[0] && loc.lng === fromCoord[1]);
            const toIndex = allLocations.findIndex(loc => loc.lat === toCoord[0] && loc.lng === toCoord[1]);
            
            let segmentDistance = 0;
            if (fromIndex !== -1 && toIndex !== -1 && distances && distances[fromIndex] && distances[fromIndex][toIndex] !== undefined) {
                segmentDistance = distances[fromIndex][toIndex] / 1000; // Convert meters to kilometers
            } else {
                 console.warn(`[VrpService] Could not find distance between ${fromCoord} and ${toCoord} in matrix.`);
            }

            routeDetails.push({
                from: itineraryStops[i],
                to: itineraryStops[i+1],
                distance: `${segmentDistance.toFixed(2)} km`
            });
        }

        const formattedFirstRoute = {
            vehicle_id: firstRoute.vehicle_id,
            totalDistance: `${(firstRoute.distance / 1000).toFixed(2)} km`,
            itinerary: itinerary,
            routeDetails: routeDetails
        };
        console.log('[VrpService] VRP optimization completed. Formatted first route details (for debug):', formattedFirstRoute);
    } else {
        console.log('[VrpService] VRP optimization completed. No routes generated by solver.');
    }
    // --- End of modification ---

    return { optimized_routes: optimized_routes_with_paths };
}