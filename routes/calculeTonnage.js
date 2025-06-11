// server/routes/calculeTonnage.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculerTonnageClient } = require('../services/calculTonnage');
const Product = require('../models/product');
const Vehicle = require('../models/vehicle');
// Import the VRP solver service directly, not the Express route
const { solveVRPService } = require('../services/vrpService'); // We will create this new service to encapsulate VRP logic

router.post('/optimize', async (req, res) => {
    try {
        const { departure_location, clients } = req.body; // num_drivers removed as it's implied by available vehicles

        // --- Input validation (kept as is, but can be made more robust) ---
        if (!departure_location || !Array.isArray(departure_location) || departure_location.length !== 2) {
            return res.status(400).json({ message: 'Invalid departure location.' });
        }
        if (!clients || !Array.isArray(clients) || clients.length === 0) {
            // If no clients, we can return early with no routes, but still show tonnage info
            return res.status(200).json({
                optimized_routes: [],
                tonnage_total_demande_clients: 0,
                capacite_total_vehicules_disponibles: 0,
                sufficientVehicles: true, // No clients, so capacity is technically sufficient
                messageCapacite: "Aucun client fourni, pas besoin d'optimisation VRP."
            });
        }
        for (const client of clients) {
            if (!client.products || !Array.isArray(client.products) || !client.coordinates) {
                return res.status(400).json({ message: 'Invalid client data: missing products or coordinates.' });
            }
        }

        // 1. Fetch all products to calculate client tonnage
        const allProducts = await Product.find({});

        // 2. Calculate total tonnage demanded by clients
        let tonnageTotalDemandeClients = 0;
        for (const client of clients) {
            if (client.products && Array.isArray(client.products)) {
                tonnageTotalDemandeClients += calculerTonnageClient(client.products, allProducts);
            }
        }
        console.log(`Tonnage total demandé par les clients: ${tonnageTotalDemandeClients.toFixed(2)} tonnes`);

        // 3. Fetch available vehicles and calculate their total capacity
        const availableVehicles = await Vehicle.find({ statut: 'disponible' });
        if (availableVehicles.length === 0) {
            return res.status(404).json({
                message: "Aucun véhicule 'disponible' trouvé dans la base de données.",
                tonnage_total_demande_clients: tonnageTotalDemandeClients,
                capacite_total_vehicules_disponibles: 0,
                sufficientVehicles: false,
                messageCapacite: "Aucun véhicule disponible pour effectuer les livraisons."
            });
        }

        let capaciteTotalVehiculesDisponibles = availableVehicles.reduce((acc, vehicle) => {
            return acc + (Number(vehicle.tonnageCapacity) || 0);
        }, 0);
        console.log(`Capacité totale des véhicules disponibles: ${capaciteTotalVehiculesDisponibles.toFixed(2)} tonnes`);

        // 4. Capacity Check
        let sufficientVehicles = tonnageTotalDemandeClients <= capaciteTotalVehiculesDisponibles;
        let messageCapacite = "";

        if (sufficientVehicles) {
            messageCapacite = "La capacité des véhicules disponibles est suffisante pour répondre à la demande.";
        } else {
            messageCapacite = "La capacité des véhicules disponibles est insuffisante. Des véhicules supplémentaires sont nécessaires.";
        }
        console.log(`Capacité suffisante: ${sufficientVehicles}, Message: ${messageCapacite}`);

        let optimizedRoutes = [];

        // Prepare data for VRP solver - ONLY IF CAPACITY IS SUFFICIENT TO PROCEED WITH OPTIMIZATION
        // Or, you might want to run VRP even if capacity is insufficient,
        // to show partial routes or prioritize clients. For now, following original logic.
        if (sufficientVehicles) {
            // Prepare client data for VRP solver with actual demand
            const clientsForVRP = clients.map(client => ({
                id: client.customerId || client._id, // Ensure a unique ID for clients
                location: client.coordinates,
                demand: client.products.reduce((acc, product) => acc + calculerTonnageClient([product], allProducts), 0)
            }));

            const vehicleCapacitiesForVRP = availableVehicles.map(v => Number(v.tonnageCapacity) || 0);

            // Call the consolidated VRP service
            try {
                const solverResult = await solveVRPService(
                    departure_location,
                    clientsForVRP,
                    availableVehicles.length,
                    vehicleCapacitiesForVRP
                );
                optimizedRoutes = solverResult.optimized_routes;
            } catch (vrpError) {
                console.error('Erreur lors de l\'appel au service VRP:', vrpError);
                // Decide how to handle this error: return 500 or proceed with partial data
                // For now, let's re-throw to be caught by the main catch block
                throw new Error(`Erreur lors de l'optimisation VRP: ${vrpError.message}`);
            }
        } else {
            // If capacity is not sufficient, do not run VRP.
            optimizedRoutes = [];
        }

        // Send the final response to the client
        res.json({
            optimized_routes: optimizedRoutes,
            tonnage_total_demande_clients: tonnageTotalDemandeClients,
            capacite_total_vehicules_disponibles: capaciteTotalVehiculesDisponibles,
            sufficientVehicles: sufficientVehicles,
            messageCapacite: messageCapacite,
        });

    } catch (error) {
        console.error('Erreur générale lors de l\'optimisation VRP:', error);
        res.status(500).json({
            message: error.message || 'Erreur interne du serveur lors de l\'optimisation des routes.',
            error: error.message,
            tonnage_total_demande_clients: 0,
            capacite_total_vehicules_disponibles: 0,
            sufficientVehicles: false,
            messageCapacite: error.message || 'Erreur lors du calcul de la capacité.'
        });
    }
});

module.exports = router;