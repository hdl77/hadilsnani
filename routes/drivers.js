// routes/drivers.js
import express from "express";
const router = express.Router();
import {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../controllers/driversController.js"; // Ajustez le chemin si nécessaire

// GET /api/drivers - Récupérer tous les chauffeurs
router.get("/", getAllDrivers);

// POST /api/drivers - Créer un nouveau chauffeur
router.post("/", createDriver);

// PUT /api/drivers/:id - Mettre à jour un chauffeur
router.put("/:id", updateDriver);

// DELETE /api/drivers/:id - Supprimer un chauffeur
router.delete("/:id", deleteDriver);

export default router;