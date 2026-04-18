const mongoose = require('mongoose');

const inventoryLedgerSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sku: { type: String, required: true },
    type: {
      type: String,
      enum: ['sale', 'refund', 'restock', 'adjustment', 'transfer_out', 'transfer_in'],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    beforeQty: { type: Number, required: true },
    afterQty: { type: Number, required: true },
    referenceType: { type: String, enum: ['order', 'refund', 'transfer', 'manual'] },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    note: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryLedger', inventoryLedgerSchema);
