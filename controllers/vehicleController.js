// controllers/vehicleController.js
import Vehicle from '../models/vehicle.js'; // Import the Vehicle Mongoose model

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Public (or Private if authentication is implemented)
const createVehicle = async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body); // req.body will now include 'statut'
    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    // Handle duplicate key error (for unique fields like matricule)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Vehicle with this matricule already exists." });
    }
    res.status(500).json({ message: "Failed to create vehicle", error: error.message });
  }
};

// @desc    Get all vehicles (with optional status filter)
// @route   GET /api/vehicles
// @access  Public
const getAllVehicles = async (req, res) => {
  try {
    const query = {};
    // Check if a 'statut' query parameter is provided
    if (req.query.statut) {
      query.statut = req.query.statut; // Filter by the provided status
    }
    const vehicles = await Vehicle.find(query); // Apply the query filter
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Failed to fetch vehicles", error: error.message });
  }
};

// @desc    Get a single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id); // This will retrieve the 'statut' field
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle by ID:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid vehicle ID format" });
    }
    res.status(500).json({ message: "Failed to fetch vehicle", error: error.message });
  }
};

// @desc    Update a vehicle by ID
// @route   PUT /api/vehicles/:id
// @access  Public (or Private)
const updateVehicle = async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body, // req.body will now include 'statut' for updates
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) { // Duplicate key error during update
      return res.status(400).json({ message: "Vehicle with this matricule already exists." });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid vehicle ID format" });
    }
    res.status(500).json({ message: "Failed to update vehicle", error: error.message });
  }
};

// @desc    Delete a vehicle by ID
// @route   DELETE /api/vehicles/:id
// @access  Public (or Private)
const deleteVehicle = async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!deletedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid vehicle ID format" });
    }
    res.status(500).json({ message: "Failed to delete vehicle", error: error.message });
  }
};

export {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};