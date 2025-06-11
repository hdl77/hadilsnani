// models/driver.js
import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['disponible', 'non disponible'], default: 'disponible', required: true }, // Ajout du champ statut
});

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;