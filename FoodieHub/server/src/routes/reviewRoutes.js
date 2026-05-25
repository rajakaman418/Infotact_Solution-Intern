const express = require('express');
const router = express.Router();
const { createReview, getKeywordSuggestions, getRestaurantReviews, markHelpful } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/suggestions/:orderId', protect, getKeywordSuggestions);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.post('/:id/helpful', protect, markHelpful);

module.exports = router;
