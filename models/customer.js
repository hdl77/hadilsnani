// models/customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  typeCustomer: { type: String, required: true },
  coordinates: {
    type: [Number], // Array of Numbers (Latitude, Longitude)
    required: true,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
