const express = require('express');
const router = express.Router();
const controller = require('../controllers/customer.controller');
const { protect } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.post('/', protect, allowRoles('cashier', 'system_admin'), controller.createCustomer);
router.get('/', protect, controller.listCustomers);

module.exports = router;
