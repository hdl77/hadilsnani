import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  departureWilaya: { type: String, required: true },
  departureDate: { type: String },
  numVehicles: { type: Number },
  numDrivers: { type: Number },
  clients: [
    {
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer", // Important: Match the model name exactly (case-sensitive)
        required: true,
      },
      // Add any other client-specific delivery info here if needed
    },
  ],
  products: [
    {
      type: { type: String },
      quantity: { type: Number },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
