import mongoose from "mongoose";
const roundSchema = new mongoose.Schema({
  round_id: { type: Number, primaryKey: true, unique: true, required: true },
  date: { type: Date },
  status: { type: String },
  total_cost: { type: Number },
  total_duration: { type: String },
  fk_vehicle_id: { type: Number, ref: "Vehicle" },
});

const Round = mongoose.model("Round", roundSchema);
export default Round;
