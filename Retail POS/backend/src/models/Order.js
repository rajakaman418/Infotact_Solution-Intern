const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    method: { type: String, enum: ['cash', 'credit', 'wallet'], required: true },
    amount: { type: Number, required: true, min: 0 },
    reference: { type: String, default: '' },
  },
  { _id: false }
);

// ✅ ADD THIS
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    channel: { type: String, enum: ['pos', 'online'], required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: {
      type: String,
      enum: ['completed', 'refunded', 'partially_refunded'],
      default: 'completed',
    },

    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, required: true, default: 0 },
    taxTotal: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true },

    promotionCode: { type: String, default: '' },

    payments: [paymentSchema],

    // ✅ ADD THIS LINE
    items: [orderItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);