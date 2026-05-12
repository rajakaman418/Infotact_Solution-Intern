const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: false },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'], default: 'mild' },
  preparationTime: { type: Number, default: 20 }, // minutes
  tags: [String],
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
});

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  capacity: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  currentReservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  cuisineType: [{ type: String }],
  image: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  // GeoJSON Point for geospatial queries
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  menu: [menuItemSchema],
  tables: [tableSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'], default: '$$' },
  openingHours: {
    monday: { open: String, close: String, isClosed: Boolean },
    tuesday: { open: String, close: String, isClosed: Boolean },
    wednesday: { open: String, close: String, isClosed: Boolean },
    thursday: { open: String, close: String, isClosed: Boolean },
    friday: { open: String, close: String, isClosed: Boolean },
    saturday: { open: String, close: String, isClosed: Boolean },
    sunday: { open: String, close: String, isClosed: Boolean },
  },
  features: {
    delivery: { type: Boolean, default: true },
    dineIn: { type: Boolean, default: true },
    tableReservation: { type: Boolean, default: true },
    events: { type: Boolean, default: false },
  },
  deliveryInfo: {
    minOrderAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 30 },
    estimatedTime: { type: Number, default: 40 }, // minutes
    deliveryRadius: { type: Number, default: 5 }, // km
  },
  commission: { type: Number, default: 15 }, // percentage
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 2dsphere index for geospatial queries
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ cuisineType: 1 });
restaurantSchema.index({ rating: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
