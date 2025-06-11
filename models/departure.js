import mongoose from "mongoose";
const departureSchema = new mongoose.Schema({
  lieu: { type: String, required: true },

  departure_coordinates: { type: [Number], required: true },

  
});

const Departure = mongoose.model("Departure", departureSchema);
export default Departure;
