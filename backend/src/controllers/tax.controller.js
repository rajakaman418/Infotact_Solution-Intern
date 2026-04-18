const TaxRule = require('../models/TaxRule');
const asyncHandler = require('../middlewares/asyncHandler');

exports.createTaxRule = asyncHandler(async (req, res) => {
  const taxRule = await TaxRule.create(req.body);
  res.status(201).json(taxRule);
});

exports.listTaxRules = asyncHandler(async (req, res) => {
  const items = await TaxRule.find({}).sort({ createdAt: -1 });
  res.json({ items });
});
