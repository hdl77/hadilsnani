// server/controllers/DemandeCalculatorController.js
import { calculateClientDemandKg } from '../services/DemandCalculator.js'; // Adjust path and extension if necessary
import Client from '../models/customer.js';     // Assuming your Client model path and ES module syntax
import Vehicle from '../models/vehicle.js';   // Assuming your Vehicle model path and ES module syntax
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url'; // Required for __dirname with ES modules

// If using ES modules, __dirname is not available directly.
// We can derive it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const optimizeVrp = async (req, res) => {
    try {
        const { departure_location, clients: requestedClients, num_vehicles } = req.body;

        if (!departure_location || !Array.isArray(departure_location) || departure_location.length !== 2 ||
            !requestedClients || !Array.isArray(requestedClients) || requestedClients.length === 0 ||
            !num_vehicles || typeof num_vehicles !== 'number' || num_vehicles <= 0) {
            return res.status(400).json({ message: "Données d'entrée VRP invalides. Assurez-vous d'avoir un lieu de départ, des clients et le nombre de véhicules." });
        }

        // --- Server-side calculation of client demands ---
        const clientsForVrpSolver = await Promise.all(
            requestedClients.map(async clientData => {
                const clientFromDb = await Client.findById(clientData.id).exec(); // Fetch client just for location and validation
                if (!clientFromDb) {
                    console.warn(`[VRP Controller] Client with ID ${clientData.id} not found in DB. Skipping this client.`);
                    return null; // Return null to filter out later
                }

                // Calculate demand using the utility function
                const demandInKg = await calculateClientDemandKg(clientData.id);

                // Display individual client demand in the terminal
                console.log(`[VRP Controller] Demande du client ${clientFromDb.name || clientFromDb._id.toString()}: ${demandInKg.toFixed(2)} kg`);

                return {
                    id: clientFromDb._id.toString(),
                    location: clientFromDb.coordinates, // Use coordinates from DB for robustness
                    demand: demandInKg
                };
            })
        );

        // Filter out any clients that were not found or had issues
        const validClientsForVrpSolver = clientsForVrpSolver.filter(client => client !== null);

        if (validClientsForVrpSolver.length === 0) {
            return res.status(400).json({ message: "Aucun client valide trouvé avec des données complètes pour l'optimisation VRP." });
        }

        // Calculate total overall client demand
        let totalOverallDemandKg = 0;
        validClientsForVrpSolver.forEach(client => {
            totalOverallDemandKg += client.demand;
        });
        console.log(`[VRP Controller] Demande totale globale des clients: ${totalOverallDemandKg.toFixed(2)} kg`);
        // --- End server-side calculation ---


        // Fetch vehicle capacities from the database
        // The `vehicle.js` schema defines 'tonnage' as Number and 'statut' with enum 'disponible'
        const vehiclesFromDb = await Vehicle.find({ statut: 'disponible' }).exec();
        const vehiclesForVrp = vehiclesFromDb.map(v => ({
            id: v._id.toString(),
            capacity: v.tonnage // 'tonnage' field is correctly used as capacity
        }));

        // Calculate total available vehicle capacity
        let totalAvailableVehicleCapacityKg = 0;
        vehiclesForVrp.forEach(vehicle => {
            totalAvailableVehicleCapacityKg += vehicle.capacity;
        });

        // --- Check and log vehicle availability in the terminal ---
        console.log(`[VRP Controller] Nombre de véhicules disponibles dans la DB (statut 'disponible'): ${vehiclesForVrp.length}`);
        console.log(`[VRP Controller] Capacité totale des véhicules disponibles: ${totalAvailableVehicleCapacityKg.toFixed(2)} kg`);
        console.log(`[VRP Controller] Nombre de véhicules demandé par le frontend: ${num_vehicles}`);

        if (vehiclesForVrp.length === 0) {
            console.error(`[VRP Controller] ERREUR: Aucun véhicule "disponible" trouvé dans la base de données. Impossible d'optimiser les routes.`);
            return res.status(400).json({ message: "Aucun véhicule disponible trouvé pour l'optimisation VRP. Veuillez en ajouter un avec le statut 'disponible'." });
        }

        if (num_vehicles > vehiclesForVrp.length) {
            console.warn(`[VRP Controller] AVERTISSEMENT: Le nombre de véhicules demandé par le frontend (${num_vehicles}) est supérieur au nombre de véhicules disponibles (${vehiclesForVrp.length}). Le solver VRP utilisera jusqu'à ${vehiclesForVrp.length} véhicules.`);
            // For OR-Tools, passing a higher num_vehicles than actual vehicle capacities is usually fine
            // as it will only use as many as needed/possible given the capacities.
        } else if (num_vehicles < vehiclesForVrp.length) {
            console.log(`[VRP Controller] INFO: Le nombre de véhicules demandé (${num_vehicles}) est inférieur au nombre de véhicules disponibles (${vehiclesForVrp.length}). Le solver VRP utilisera les ${num_vehicles} premiers véhicules ou ceux choisis par l'algorithme.`);
        }
        // --- End vehicle check ---

        // Check if total demand exceeds total available capacity
        if (totalOverallDemandKg > totalAvailableVehicleCapacityKg) {
            console.warn(`[VRP Controller] AVERTISSEMENT: La demande totale des clients (${totalOverallDemandKg.toFixed(2)} kg) est supérieure à la capacité totale disponible des véhicules (${totalAvailableVehicleCapacityKg.toFixed(2)} kg). Plus de véhicules sont nécessaires.`);
        } else {
            console.log(`[VRP Controller] INFO: La capacité totale des véhicules est suffisante pour la demande totale des clients.`);
        }

        const vrpInputData = {
            departure_location: departure_location,
            clients: validClientsForVrpSolver, // Use the server-calculated and validated demands
            num_vehicles: num_vehicles, // Use the requested number of vehicles
            vehicles: vehiclesForVrp // Pass all available vehicle capacities from DB
        };

        const pythonScriptPath = path.join(__dirname, '../python_solver/vrp_solver_script.py'); // Corrected path based on CaptureServer.PNG
        const pythonProcess = spawn('python', [pythonScriptPath, JSON.stringify(vrpInputData)]);

        let scriptOutput = '';
        let scriptError = '';

        pythonProcess.stdout.on('data', (data) => {
            scriptOutput += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            scriptError += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`[VRP Controller] Python script exited with code ${code}`);
                console.error('[VRP Controller] Python script error:', scriptError);
                return res.status(500).json({ message: "Erreur lors de l'optimisation des routes VRP.", error: scriptError });
            }

            try {
                const result = JSON.parse(scriptOutput);

                // --- Post-solver analysis for unmet demand ---
                let unmetDemandKg = 0;
                // This assumes your Python solver either returns an 'unassigned_demand_kg' field
                // or you can derive it from the 'routes' information.
                // For demonstration, let's assume the solver returns an 'unassigned_clients' array
                // or the 'routes' array clearly shows which clients were NOT visited.
                // A more robust solution would have the Python solver explicitly return unmet demand.

                // Example: If the solver returns a list of clients NOT serviced:
                // if (result.unassigned_clients && Array.isArray(result.unassigned_clients)) {
                //     for (const unassignedClientId of result.unassigned_clients) {
                //         const unassignedClient = validClientsForVrpSolver.find(c => c.id === unassignedClientId);
                //         if (unassignedClient) {
                //             unmetDemandKg += unassignedClient.demand;
                //         }
                //     }
                // } else {
                    // Fallback: If solver doesn't give unassigned clients directly,
                    // calculate by comparing all clients vs. clients in routes.
                    const clientsInSolution = new Set();
                    if (result.routes && Array.isArray(result.routes)) {
                        result.routes.forEach(route => {
                            if (route.length > 0) { // Check if route has steps
                                route.forEach(step => {
                                    // Assuming client information is available in each step of the route
                                    // You might need to adjust 'step.client_id' based on actual solver output format
                                    if (step.client_id) {
                                        clientsInSolution.add(step.client_id);
                                    }
                                });
                            }
                        });
                    }

                    validClientsForVrpSolver.forEach(client => {
                        if (!clientsInSolution.has(client.id)) {
                            unmetDemandKg += client.demand;
                        }
                    });
                // }

                // Ensure unmetDemandKg is not negative due to floating point inaccuracies
                unmetDemandKg = Math.max(0, unmetDemandKg);


                if (result.error && result.error.includes("No solution found")) {
                    console.warn("[VRP Controller] Le solveur VRP n'a pas trouvé de solution. Cela pourrait être dû à une capacité insuffisante, à des contraintes trop strictes ou à des données invalides.");
                    return res.status(200).json({ message: "Le solveur VRP n'a pas trouvé de solution. Vérifiez les capacités des véhicules, les demandes des clients et les contraintes.", routes: [] });
                } else if (unmetDemandKg > 0.01) { // Use a small epsilon for floating point comparison
                    console.warn(`[VRP Controller] AVERTISSEMENT: Une demande totale de ${unmetDemandKg.toFixed(2)} kg n'a pas pu être satisfaite par le solveur VRP avec les véhicules alloués. Des véhicules supplémentaires pourraient être nécessaires pour couvrir cette demande restante.`);
                    // You might still return the partial solution if one was found
                    res.json(result);
                } else {
                    console.log(`[VRP Controller] INFO: Toutes les demandes des clients ont été satisfaites par le solveur VRP.`);
                    res.json(result);
                }
                // --- End post-solver analysis ---

            } catch (parseError) {
                console.error('[VRP Controller] Error parsing Python script output:', parseError);
                console.error('[VRP Controller] Raw Python script output:', scriptOutput);
                res.status(500).json({ message: "Erreur lors du traitement de la réponse VRP. Format de sortie inattendu.", error: parseError.message });
            }
        });

    } catch (error) {
        console.error("[VRP Controller] Erreur interne du serveur lors de l'optimisation VRP:", error);
        res.status(500).json({ message: "Erreur interne du serveur lors de l'optimisation VRP.", error: error.message });
    }
};