import Customer from "../models/customer.js";

// Contrôleur pour récupérer tous les clients
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    return res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch customers", error: error });
  }
};
