const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['consumer', 'restaurant', 'courier', 'admin'], default: 'consumer' },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  loyaltyPoints: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  badges: [{ type: String }],
  favoriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
