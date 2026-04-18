const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['retail', 'warehouse'], required: true },
    address: { type: String, required: true },
    city: String,
    state: String,
    country: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
