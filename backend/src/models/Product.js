const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, index: true },
    barcode: { type: String, index: true },
    size: String,
    color: String,
    attributes: { type: Map, of: String },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, text: true },
    description: { type: String, default: '', text: true },
    brand: { type: String, trim: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, index: true },
    variants: [variantSchema],
    tags: [{ type: String, index: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', brand: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
