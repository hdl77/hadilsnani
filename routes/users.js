// routes/users.js
import express from "express";
const router = express.Router();
import {
  signupUser,
  getAllUsers,
  loginUser,
} from "../controllers/usersController.js";

// Route d'inscription pour les utilisateurs
router.post("/signup", signupUser);

// Route pour récupérer tous les utilisateurs
router.get("/", getAllUsers);

// Route pour la connexion des utilisateurs
router.post("/login", loginUser);

export default router;
