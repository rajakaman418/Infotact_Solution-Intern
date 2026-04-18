const mongoose = require('mongoose');

const taxRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    jurisdiction: { type: String, required: true, index: true },
    rate: { type: Number, required: true, min: 0 },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', default: null },
    category: { type: String, default: 'default' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TaxRule', taxRuleSchema);
