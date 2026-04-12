import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);