import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

import User from "./models/user.js";
import Customer from "./models/customer.js";
import Driver from "./models/driver.js"; // Import the Driver model
// Importez le modèle Customer
import connectDB from "./configs/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Route d'inscription pour les utilisateurs
app.post("/api/users/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Sauvegarder l'utilisateur
    await newUser.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong during signup", error: error });
  }
});

// Route pour récupérer tous les utilisateurs
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error });
  }
});

// Nouvelle route pour récupérer tous les clients (pour afficher le tableau des clients)
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find(); // Récupère tous les documents de la collection 'customer'
    return res.status(200).json(customers); // Envoie les clients au format JSON
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch customers", error: error });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" }); // Utilisateur non trouvé
    }

    // 2. Comparer le mot de passe avec le mot de passe haché
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" }); // Mot de passe incorrect
    }

    // 3. Si les informations d'identification sont valides, vous pouvez générer un token (JWT par exemple) pour l'authentification.
    //    Pour l'instant, pour simplifier, nous allons simplement renvoyer un message de succès.
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong during login", error: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
});
