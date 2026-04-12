import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  change: {
    type: Number, // +10 (add), -5 (sale)
  },
  type: {
    type: String, // "ADD" | "SALE"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("InventoryLog", inventoryLogSchema);