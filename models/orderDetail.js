import mongoose from "mongoose";
const orderDetailSchema = new mongoose.Schema({
  order_detail_id: {
    type: Number,
    primaryKey: true,
    unique: true,
    required: true,
  },
  fk_order_id: { type: Number, ref: "Order", required: true },
  fk_product_id: { type: Number, ref: "Product", required: true },
  quantity: { type: Number },
});

const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);
export default OrderDetail;
