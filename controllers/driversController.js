// controllers/driversController.js
import Driver from "../models/driver.js";

// Récupérer tous les chauffeurs
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    console.error("Erreur lors de la récupération des chauffeurs :", error);
    res.status(500).json({ message: "Échec de la récupération des chauffeurs", error: error });
  }
};

// Créer un nouveau chauffeur
export const createDriver = async (req, res) => {
  try {
    const { name, phone, status } = req.body;
    const newDriver = new Driver({ name, phone, status });
    const savedDriver = await newDriver.save();
    res.status(201).json(savedDriver);
  } catch (error) {
    console.error("Erreur lors de la création du chauffeur :", error);
    res.status(500).json({ message: "Impossible de créer le chauffeur", error: error });
  }
};

// Mettre à jour un chauffeur
export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, status } = req.body;

    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({ message: "Chauffeur introuvable" });
    }

    driver.name = name || driver.name;
    driver.phone = phone || driver.phone;
    driver.status = status || driver.status; // Mettre à jour le statut

    const updatedDriver = await driver.save();
    res.status(200).json(updatedDriver);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du chauffeur :", error);
    res.status(500).json({ message: "Impossible de mettre à jour le chauffeur", error: error });
  }
};

// Supprimer un chauffeur
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Driver.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Chauffeur introuvable" });
    }
    res.status(200).json({ message: "Chauffeur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du chauffeur :", error);
    res.status(500).json({ message: "Impossible de supprimer le chauffeur", error: error });
  }
};