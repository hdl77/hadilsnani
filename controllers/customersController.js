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

// Controller for creating a new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, address, typeCustomer, coordinates } = req.body;
    const newCustomer = new Customer({
      name,
      address,
      typeCustomer,
      coordinates,
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Could not create customer", error: error });
  }
};

// Controller for updating a customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, typeCustomer, coordinates } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.name = name || customer.name;
    customer.address = address || customer.address;
    customer.typeCustomer = typeCustomer || customer.typeCustomer;
    customer.coordinates = coordinates || customer.coordinates;

    const updatedCustomer = await customer.save();
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Could not update customer", error: error });
  }
};

// Controller for deleting a customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Customer.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Could not delete customer", error: error });
  }
};