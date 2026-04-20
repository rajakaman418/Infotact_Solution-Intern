const Promotion = require('../models/Promotion');
const asyncHandler = require('../middlewares/asyncHandler');

exports.createPromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.create(req.body);
  res.status(201).json(promotion);
});

exports.listPromotions = asyncHandler(async (req, res) => {
  const items = await Promotion.find({}).sort({ createdAt: -1 });
  res.json({ items });
});
