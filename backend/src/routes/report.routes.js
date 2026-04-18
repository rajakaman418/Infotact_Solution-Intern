const express = require('express');
const router = express.Router();
const controller = require('../controllers/report.controller');
const { protect } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.get('/sales-summary', protect, allowRoles('system_admin'), controller.salesSummary);
router.get('/inventory-valuation', protect, allowRoles('system_admin', 'inventory_manager'), controller.inventoryValuation);
router.get('/sales', protect, allowRoles('system_admin'), controller.salesReport);

module.exports = router;
