const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, enum: ['flat', 'percent'], required: true },
    value: { type: Number, required: true },
    minCartValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    active: { type: Boolean, default: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    applicableStoreIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Promotion', promotionSchema);
