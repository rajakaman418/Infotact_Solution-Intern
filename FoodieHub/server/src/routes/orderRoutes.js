const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  getRestaurantOrders,
  getRestaurantAnalytics,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Inject io into req
const withIo = (io) => (req, res, next) => {
  req.io = io;
  next();
};

module.exports = (io) => {
  router.post('/', protect, withIo(io), createOrder);
  router.get('/', protect, getUserOrders);
  router.get('/restaurant/:restaurantId', protect, getRestaurantOrders);
  router.get('/restaurant/:restaurantId/analytics', protect, getRestaurantAnalytics);
  router.get('/:id', protect, getOrder);
  router.patch('/:id/status', protect, withIo(io), updateOrderStatus);
  return router;
};
