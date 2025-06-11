// routes/product.js (This file now acts purely as a router)
import express from "express";
const router = express.Router();
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'; // Import functions from the controller

// Routes for /api/products
router.route('/')
  .post(createProduct)       // Maps POST /api/products to createProduct controller
  .get(getAllProducts);      // Maps GET /api/products to getAllProducts controller

// Routes for /api/products/:id
router.route('/:id')
  .get(getProductById)       // Maps GET /api/products/:id to getProductById controller
  .put(updateProduct)        // Maps PUT /api/products/:id to updateProduct controller
  .delete(deleteProduct);    // Maps DELETE /api/products/:id to deleteProduct controller

export default router;