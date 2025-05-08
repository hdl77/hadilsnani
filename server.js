import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Import des fonctions de configuration et de connexion
import connectDB from "./configs/db.js";

// Import des modèles
import User from "./models/user.js";
import Customer from "./models/customer.js";
import Driver from "./models/driver.js";
import Product from "./models/product.js";
import Order from "./models/Order.js";
import Delivery from "./models/delivery.js";
import Round from "./models/Round.js";
import Departure from "./models/departure.js";
import OrderDetail from "./models/orderDetail.js";
import Vehicle from "./models/vehicle.js";

// Import des routes
import userRoutes from "./routes/users.js";
import customerRoutes from "./routes/customers.js";
import deliveriesRoutes from "./routes/deliveries.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Utilisez le middleware intégré à Express

// Connexion à la base de données
connectDB().catch((err) => {
  console.error(
    "Erreur de connexion à la base de données au démarrage du serveur:",
    err
  );
  // Peut-être quitter le processus ici, selon votre stratégie de gestion des erreurs
  // process.exit(1);
});

// Utilisation des routes
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/deliveries", deliveriesRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
});
