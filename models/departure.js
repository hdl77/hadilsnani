import mongoose from "mongoose";
const departureSchema = new mongoose.Schema({
  departure_id: {
    type: Number,
    primaryKey: true,
    unique: true,
    required: true,
  },
  departure_time: { type: String },
  departure_coordinates: { type: String },
  fk_delivery_id: { type: Number, ref: "Delivery", required: true },
});

const Departure = mongoose.model("Departure", departureSchema);
export default Departure;
