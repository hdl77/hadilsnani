// routes/vehicleRoutes.js
import express from "express";
const router = express.Router();
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js'; // Import functions from the controller

// Base route for /api/vehicles
router.route('/')
  .post(createVehicle)
  .get(getAllVehicles);

// Routes for /api/vehicles/:id
router.route('/:id')
  .get(getVehicleById)
  .put(updateVehicle)
  .delete(deleteVehicle);

export default router;