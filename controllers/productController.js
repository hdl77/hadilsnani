// controllers/productController.js
import Product from '../models/product.js'; // Import your Product Mongoose model

// @desc    Create a new product
// @route   POST /api/products
// @access  Public (or Private if authentication is implemented)
const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // Find all products
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    // Handle invalid ObjectId format gracefully
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// @desc    Update a product by ID
// @route   PUT /api/products/:id
// @access  Public (or Private)
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

// @desc    Delete a product by ID
// @route   DELETE /api/products/:id
// @access  Public (or Private)
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};