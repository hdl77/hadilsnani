import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  unite: { type: String }, // This must be 'String' to accept 'g' or 'L'
  weight: { type: Number },
  price: { type: Number },
});

const Product = mongoose.model("Product", productSchema);
export default Product;