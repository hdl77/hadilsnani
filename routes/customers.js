// routes/customers.js
import express from "express";
const router = express.Router();
// Import the controller functions
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customersController.js"; // Adjust the path as necessary

// GET /api/customers - Retrieve all customers
router.get("/", getAllCustomers); // Using the controller function

// POST /api/customers - Create a new customer
router.post("/", createCustomer); // Using the controller function

// PUT /api/customers/:id - Update a customer by ID
router.put("/:id", updateCustomer); // NEW: Route for updating a customer

// DELETE /api/customers/:id - Delete a customer by ID
router.delete("/:id", deleteCustomer); // NEW: Route for deleting a customer

export default router;