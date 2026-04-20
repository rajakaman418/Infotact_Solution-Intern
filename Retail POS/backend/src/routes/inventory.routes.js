const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');
const { protect } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.get('/stock', protect, controller.getStock);
router.get('/low-stock', protect, controller.getLowStockItems);
router.get('/ledger', protect, controller.getLedger);

router.post(
  '/add',
  protect,
  allowRoles('inventory_manager', 'system_admin'),
  controller.addStock
);

router.post(
  '/transfers',
  protect,
  allowRoles('inventory_manager', 'system_admin'),
  controller.createTransfer
);

module.exports = router;