import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  typeCustomer: {
    type: String,
    required: true,
    enum: ["point de vente", "laiterie"],
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const customer = mongoose.model("customer", customerSchema);
export default customer;
