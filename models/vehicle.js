import mongoose from "mongoose";
const vehicleSchema = new mongoose.Schema({
  vehicle_id: { type: Number, primaryKey: true, unique: true, required: true },
  type: { type: String, maxLength: 50 },
  volume_capacity: { type: Number },
  weight_capacity: { type: Number },
  cost_per_km: { type: Number },
  fk_driver_id: { type: Number, ref: "Driver" },
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
