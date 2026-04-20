const Store = require('../models/Store');
const asyncHandler = require('../middlewares/asyncHandler');

exports.createStore = asyncHandler(async (req, res) => {
  const store = await Store.create(req.body);
  res.status(201).json(store);
});

exports.listStores = asyncHandler(async (req, res) => {
  const items = await Store.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ items });
});
