// routes/customers.js
import express from "express";
const router = express.Router();
import Customer from "../models/customer.js"; // Adjust the path if necessary

// POST /api/customers - Create a new customer
router.post("/", async (req, res) => {
  try {
    const { name, typeCustomer, coordinates } = req.body;
    const newCustomer = new Customer({
      name,
      typeCustomer,
      coordinates,
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer); // Send back the saved customer
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Could not create customer" });
  }
});
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Could not fetch customers" });
  }
});

// Add other customer routes here (GET, PUT, DELETE) if needed...

export default router;
