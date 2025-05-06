import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  order_id: { type: Number, primaryKey: true, unique: true, required: true },
  order_date: { type: Date, required: true },
  status: { type: String },
  fk_client_id: { type: Number, ref: "Client", required: true },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
