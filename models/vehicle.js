// models/vehicle.js

import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  matricule: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    maxLength: 50,
  },
  tonnageCapacity: { // <-- CORRIGÉ : Renommé en tonnageCapacity
    type: Number,
    required: true, // La capacité est obligatoire
    min: 0,         // La capacité doit être un nombre positif ou nul
  },
  statut: {
    type: String,
    enum: ['disponible', 'non disponible'],
    default: 'disponible',
    required: true,
  },
  
}, { timestamps: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;