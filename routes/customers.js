import express from "express";
const router = express.Router();
import { getAllCustomers } from "../controllers/customersController.js";

// Nouvelle route pour récupérer tous les clients (pour afficher le tableau des clients)
router.get("/", getAllCustomers);

export default router;
