import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  volume: { type: Number },
  weight: { type: Number },
  unit_price: { type: Number },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
