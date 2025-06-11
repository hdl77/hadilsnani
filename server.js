// server.js (Votre fichier actuel, pas de changement nécessaire s'il est comme ceci)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

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
import Vehicle from "./models/vehicle.js"; // Corrected casing

// Import des routes
import userRoutes from "./routes/users.js";
import customerRoutes from "./routes/customers.js";
import deliveriesRoutes from "./routes/deliveries.js";
import productRoutes from "./routes/product.js";
import vehicleRoutes from "./routes/vehicles.js";
import driverRoutes from "./routes/drivers.js";
import departureRoutes from "./routes/departure.js";

// Ces imports seront maintenant corrects si les fichiers correspondants utilisent "export default router;"
//import calculeTonnageRoutes from"./routes/calculeTonnage.js";
import vrpRoutes from "./routes/vrpRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware essentiels
app.use(cors());
app.use(express.json());

// Connexion à la base de données
connectDB().catch((err) => {
  console.error(
    "Erreur de connexion à la base de données au démarrage du serveur :",
    err
  );
});

// Utilisation des routes de l'API
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/deliveries", deliveriesRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/departures", departureRoutes);
//app.use("/api/calculeTonnage", calculeTonnageRoutes);
app.use("/api/vrp", vrpRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur écoutant sur http://localhost:${PORT}/`);
  console.log("----------------------------------------------");
  console.log("Points d'API disponibles :");
  console.log(`- http://localhost:${PORT}/api/users`);
  console.log(`- http://localhost:${PORT}/api/customers (GET, POST, PUT/:id, DELETE/:id)`);
  console.log(`- http://localhost:${PORT}/api/deliveries`);
  console.log(`- http://localhost:${PORT}/api/products`);
  console.log(`- http://localhost:${PORT}/api/vehicles`);
  console.log(`- http://localhost:${PORT}/api/drivers`);
  console.log(`- http://localhost:${PORT}/api/departures`);
  console.log(`- http://localhost:${PORT}/api/vrp/optimize (POST)`);
  console.log("----------------------------------------------");
});