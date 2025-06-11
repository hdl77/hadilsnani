// controllers/vrpController.js

const calculateSimpleDistance = (p1, p2) => {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy) * 111000;
};

const optimizeRoutes = async (req, res) => {
    try {
        const { departure_location, clients, num_vehicles } = req.body;

        // Validation des entrées
        if (!departure_location || !Array.isArray(departure_location) || departure_location.length !== 2 || typeof departure_location[0] !== 'number' || typeof departure_location[1] !== 'number') {
            return res.status(400).json({ message: 'Departure location is required and must be a valid array [lat, lng].' });
        }
        if (!clients || !Array.isArray(clients) || clients.length === 0) {
            return res.status(400).json({ message: 'At least one client with location and demand is required.' });
        }
        if (!num_vehicles || typeof num_vehicles !== 'number' || num_vehicles < 1) {
            return res.status(400).json({ message: 'Number of vehicles must be a positive integer.' });
        }

        console.log('Backend (vrpController) received VRP request:');
        console.log('  Departure Location:', departure_location);
        console.log('  Clients:', clients.map(c => ({ id: c.id, coords: c.location })));
        console.log('  Num Vehicles:', num_vehicles);

        // Calculer le tonnage total demandé par client
        const clientsWithTonnage = clients.map(client => {
            const totalTonnage = client.products.reduce((sum, product) => sum + product.quantity, 0);
            return {
                ...client,
                totalTonnage: totalTonnage // Ajout du tonnage total pour chaque client
            };
        });

        // Logique d'optimisation (simplifiée)
        const optimized_routes_result = [];
        const assignedClients = Array.from({ length: num_vehicles }, () => []);
        let clientIdx = 0;

        while (clientsWithTonnage.length > 0) {
            const client = clientsWithTonnage.shift();
            assignedClients[clientIdx % num_vehicles].push(client);
            clientIdx++;
        }

        for (let i = 0; i < num_vehicles; i++) {
            const vehicleClients = assignedClients[i];
            let currentPath = [departure_location];
            let currentDistance = 0;
            let currentDuration = 0;
            let lastLocation = departure_location;

            if (vehicleClients.length > 0) {
                for (const client of vehicleClients) {
                    const clientCoords = client.location;
                    const distToClient = calculateSimpleDistance(lastLocation, clientCoords);
                    currentPath.push(clientCoords);
                    currentDistance += distToClient;
                    currentDuration += distToClient / 10; // Simple speed
                    lastLocation = clientCoords;
                }
                currentPath.push(departure_location);
                const distToDepot = calculateSimpleDistance(lastLocation, departure_location);
                currentDistance += distToDepot;
                currentDuration += distToDepot / 10;

                optimized_routes_result.push({
                    vehicle_id: `vehicle-${i + 1}`,
                    path: currentPath,
                    distance: currentDistance,
                    duration: currentDuration,
                    clients_served: vehicleClients.map(c => ({
                        id: c.id,
                        totalTonnage: c.totalTonnage // Inclure le tonnage total du client
                    }))
                });
            }
        }

        console.log('Backend (vrpController) sending optimized routes:');
        res.status(200).json({
            message: 'VRP optimization processed.',
            optimized_routes: optimized_routes_result
        });

    } catch (error) {
        console.error('Error in VRP optimization endpoint (vrpController):', error);
        res.status(500).json({ message: 'Internal server error during VRP optimization.', error: error.message });
    }
};

export default {
    optimizeRoutes,
};
