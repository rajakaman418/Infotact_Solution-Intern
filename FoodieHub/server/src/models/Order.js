const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  courier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: { type: String, enum: ['delivery', 'dine-in', 'reservation'], required: true },
  items: [orderItemSchema],

  // Order Status State Machine
  status: {
    type: String,
    enum: [
      'PENDING',
      'ACCEPTED',
      'ORDER_PREPARING',
      'READY_FOR_PICKUP',
      'COURIER_ASSIGNED',
      'IN_TRANSIT',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED',
      'REJECTED',
    ],
    default: 'PENDING',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],

  // Delivery details
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number], // [lng, lat]
    },
  },

  // Reservation details
  reservationDetails: {
    date: Date,
    time: String,
    partySize: Number,
    tableNumber: Number,
    specialRequests: String,
  },

  // Courier live location (updated via WebSocket)
  courierLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },

  // Pricing
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  // Payment
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['card', 'upi', 'cod', 'wallet'], default: 'card' },
  transactionId: { type: String, default: null },

  // Review
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
  hasReview: { type: Boolean, default: false },

  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  specialInstructions: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-generate order number
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `FD${timestamp}${random}`;
  }
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  this.updatedAt = new Date();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ courier: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
