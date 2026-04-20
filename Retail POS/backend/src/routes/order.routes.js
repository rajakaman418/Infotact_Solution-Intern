const express = require('express');
const router = express.Router();

const controller = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

// Checkout (POS)
router.post(
  '/checkout', // changed from /pos-checkout
  protect,
  allowRoles('cashier', 'system_admin'),
  controller.createPOSOrder
);

// Refund order
router.post(
  '/:id/refund',
  protect,
  allowRoles('cashier', 'system_admin'),
  controller.refundOrder
);

// Get all orders
router.get('/', protect, controller.listOrders);

// Get single order
router.get('/:id', protect, controller.getOrderById);

// Update order status (NEW - recommended)
router.patch(
  '/:id/status',
  protect,
  allowRoles('system_admin'),
  controller.updateOrderStatus
);

module.exports = router;