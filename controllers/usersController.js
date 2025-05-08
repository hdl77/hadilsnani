// controllers/usersController.js
import bcrypt from "bcryptjs";
import User from "../models/user.js";

// Contrôleur pour l'inscription d'un utilisateur
export const signupUser = async (req, res) => {
  console.log("Requête Signup reçue avec le corps :", req.body);
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
};

// Contrôleur pour récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error });
  }
};

// Contrôleur pour la connexion d'un utilisateur
export const loginUser = async (req, res) => {
  console.log("Requête Login reçue avec le corps :", req.body);
  try {
    const { email, password } = req.body;

    // 1. Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email incorrect" }); // Message plus précis
    }

    // 2. Comparer le mot de passe avec le mot de passe haché
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mot de passe incorrect" }); // Message spécifique pour mot de passe faux
    }

    // 3. Si les informations d'identification sont valides
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong during login", error: error });
  }
};
