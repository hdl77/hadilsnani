import express from "express";
import {
  createDelivery,
  getAllDeliveries,
} from "../controllers/deliveriesController.js";

const router = express.Router();

router.post("/api/deliveries", createDelivery);
router.get("/api/deliveries", getAllDeliveries);

export default router;

// Add other delivery-related routes here (e.g., GET /api/deliveries/:id, PUT /api/deliveries/:id, DELETE /api/deliveries/:id)
