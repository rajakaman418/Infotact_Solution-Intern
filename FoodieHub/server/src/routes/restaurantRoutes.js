const express = require('express');
const router = express.Router();
const {
  getNearbyRestaurants,
  getRestaurant,
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  toggleMenuItem,
  addMenuItem,
  getMyRestaurant,
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

router.get('/nearby', getNearbyRestaurants);
router.get('/my-restaurant', protect, getMyRestaurant);
router.get('/:id', getRestaurant);
router.get('/', getRestaurants);
router.post('/', protect, createRestaurant);
router.put('/:id', protect, updateRestaurant);
router.post('/:id/menu', protect, addMenuItem);
router.patch('/:id/menu/:itemId/toggle', protect, toggleMenuItem);

module.exports = router;
