import mongoose from "mongoose";
const deliverySchema = new mongoose.Schema({
  delivery_id: { type: Number, primaryKey: true, unique: true, required: true },
  new_address: { type: String },
  departure_time: { type: String },
  arrival_time: { type: String },
  status: { type: String },
  fk_round_id: { type: Number, ref: "Round" },
  fk_order_id: { type: Number, ref: "Order", required: true },
  delivery_cost: { type: Number },
});

const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;
