import express from 'express';
import Departure from '../models/departure.js';

const router = express.Router();

// GET all departure locations
router.get('/', async (req, res) => {
    try {
        const departures = await Departure.find({});
        res.status(200).json(departures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new departure location
router.post('/', async (req, res) => {
    const { lieu, departure_coordinates } = req.body; // Removed departure_time as it's not in the schema

    // Basic validation
    if (!lieu || !departure_coordinates || !Array.isArray(departure_coordinates) || departure_coordinates.length !== 2) {
        return res.status(400).json({ message: "Le lieu et les coordonnées de départ sont requis et les coordonnées doivent être un tableau de [lat, lng]." });
    }

    const newDeparture = new Departure({
        lieu,
        departure_coordinates,
    });

    try {
        const savedDeparture = await newDeparture.save();
        res.status(201).json(savedDeparture);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT (Update) an existing departure location
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { lieu, departure_coordinates } = req.body;

    // Basic validation for update
    if (!lieu || !departure_coordinates || !Array.isArray(departure_coordinates) || departure_coordinates.length !== 2) {
        return res.status(400).json({ message: "Le lieu et les coordonnées de départ sont requis et les coordonnées doivent être un tableau de [lat, lng]." });
    }

    try {
        const updatedDeparture = await Departure.findByIdAndUpdate(
            id,
            { lieu, departure_coordinates },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!updatedDeparture) {
            return res.status(404).json({ message: "Lieu de départ non trouvé." });
        }

        res.status(200).json(updatedDeparture);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a departure location
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedDeparture = await Departure.findByIdAndDelete(id);

        if (!deletedDeparture) {
            return res.status(404).json({ message: "Lieu de départ non trouvé." });
        }

        res.status(200).json({ message: "Lieu de départ supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;