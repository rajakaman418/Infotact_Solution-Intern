const Customer = require('../models/Customer');
const asyncHandler = require('../middlewares/asyncHandler');

exports.createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(customer);
});

exports.listCustomers = asyncHandler(async (req, res) => {
  const items = await Customer.find({}).sort({ createdAt: -1 }).limit(100);
  res.json({ items });
});
