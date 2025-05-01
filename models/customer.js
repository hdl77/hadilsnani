import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  typeCustomer: {
    type: String,
    required: true,
    enum: ["point de vente", "laiterie"],
  },
  coordinates_x: {
    type: [Number],
    required: true,
  },
  coordinates_y: {
    type: [Number],
    required: true,
  },
});

const customer = mongoose.model("customer", customerSchema);
export default customer;
