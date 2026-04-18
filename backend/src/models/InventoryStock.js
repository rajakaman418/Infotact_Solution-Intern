const mongoose = require('mongoose');

const inventoryStockSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    sku: { type: String, required: true, index: true },
    quantityOnHand: { type: Number, required: true, default: 0 },
    reorderPoint: { type: Number, default: 5 },
    reservedQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

inventoryStockSchema.index({ storeId: 1, variantId: 1 }, { unique: true });

module.exports = mongoose.model('InventoryStock', inventoryStockSchema);
