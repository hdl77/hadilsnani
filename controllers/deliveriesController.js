import Delivery from "../models/delivery.js";

export const createDelivery = async (req, res) => {
  try {
    const {
      departureWilaya,
      departureDate,
      numVehicles,
      numDrivers,
      clients,
      products,
    } = req.body;

    const newDelivery = new Delivery({
      departureWilaya,
      departureDate,
      numVehicles,
      numDrivers,
      clients: clients.map((client) => ({
        customer: client.customer, // Utilisez directement client.customer
      })),
      products,
    });

    const savedDelivery = await newDelivery.save();
    res.status(201).json(savedDelivery);
  } catch (error) {
    console.error("Error creating delivery:", error);
    console.error(error.stack); // Log the stack trace for detailed debugging
    res
      .status(500)
      .json({ message: "Failed to create delivery", error: error.message });
  }
};

export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find().populate("clients.customer"); // Populate customer details
    res.status(200).json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch deliveries", error: error.message });
  }
};

// Add other delivery-related controller functions here (e.g., getDeliveryById, updateDelivery, deleteDelivery)
