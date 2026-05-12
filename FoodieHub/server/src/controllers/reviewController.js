const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// AI-powered keyword suggestions based on order history
const generateKeywordSuggestions = (items, cuisineType) => {
  const keywordMap = {
    'pizza': ['crispy crust', 'melted cheese', 'flavorful toppings', 'authentic Italian'],
    'burger': ['juicy patty', 'fresh bun', 'crispy lettuce', 'smoky flavor'],
    'biryani': ['aromatic basmati', 'tender meat', 'perfect spice blend', 'authentic dum'],
    'chinese': ['wok-tossed', 'umami-rich', 'silky sauce', 'fresh vegetables'],
    'south indian': ['crispy dosa', 'fluffy idli', 'tangy sambar', 'fresh coconut chutney'],
    'north indian': ['rich gravy', 'tender paneer', 'buttery naan', 'aromatic spices'],
    'dessert': ['perfectly sweetened', 'creamy texture', 'rich flavor', 'melt-in-mouth'],
    'default': ['fresh ingredients', 'well-seasoned', 'generous portions', 'excellent presentation'],
  };

  const suggestions = new Set();
  items.forEach((item) => {
    const itemLower = item.name.toLowerCase();
    Object.keys(keywordMap).forEach((key) => {
      if (itemLower.includes(key)) {
        keywordMap[key].forEach((kw) => suggestions.add(kw));
      }
    });
  });

  if (cuisineType) {
    const cuisineLower = cuisineType.toLowerCase();
    Object.keys(keywordMap).forEach((key) => {
      if (cuisineLower.includes(key)) {
        keywordMap[key].forEach((kw) => suggestions.add(kw));
      }
    });
  }

  if (suggestions.size < 4) {
    keywordMap['default'].forEach((kw) => suggestions.add(kw));
  }

  return Array.from(suggestions).slice(0, 8);
};

// @desc    Create review (gamified)
// @route   POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { orderId, ratings, title, content, images, tags, aiKeywordsUsed } = req.body;

    // Validate order belongs to user and is completed
    const order = await Order.findById(orderId).populate('restaurant', 'name cuisineType');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.userId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    if (order.hasReview) return res.status(400).json({ success: false, message: 'Review already submitted for this order' });
    if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Can only review completed orders' });
    }

    // Create review (gamification scores computed in pre-save hook)
    const review = await Review.create({
      user: req.user.userId,
      restaurant: order.restaurant._id,
      order: orderId,
      ratings,
      title,
      content,
      images: images || [],
      tags: tags || [],
      aiKeywordsUsed: aiKeywordsUsed || [],
    });

    // Mark order as reviewed
    await Order.findByIdAndUpdate(orderId, { hasReview: true, review: review._id });

    // Update restaurant rating
    const restaurantReviews = await Review.find({ restaurant: order.restaurant._id });
    const avgRating = restaurantReviews.reduce((acc, r) => acc + r.ratings.overall, 0) / restaurantReviews.length;
    await Restaurant.findByIdAndUpdate(order.restaurant._id, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: restaurantReviews.length,
    });

    // Award loyalty points to user
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: {
        loyaltyPoints: review.pointsAwarded,
        totalReviews: 1,
      },
    });

    // Award badges
    const user = await User.findById(req.user.userId);
    const badges = [...(user.badges || [])];
    if (user.totalReviews >= 1 && !badges.includes('First Review')) badges.push('First Review');
    if (user.totalReviews >= 5 && !badges.includes('Regular Reviewer')) badges.push('Regular Reviewer');
    if (user.totalReviews >= 10 && !badges.includes('Power Reviewer')) badges.push('Power Reviewer');
    if (review.qualityTier === 'platinum' && !badges.includes('Quality Writer')) badges.push('Quality Writer');
    if (user.loyaltyPoints >= 500 && !badges.includes('Loyalty Champion')) badges.push('Loyalty Champion');

    await User.findByIdAndUpdate(req.user.userId, { badges });

    res.status(201).json({
      success: true,
      data: review,
      rewards: {
        pointsAwarded: review.pointsAwarded,
        qualityTier: review.qualityTier,
        wordCount: review.wordCount,
        keywordScore: review.keywordScore,
        mediaBonus: review.mediaBonus,
        totalUserPoints: user.loyaltyPoints + review.pointsAwarded,
        newBadges: badges.filter((b) => !user.badges.includes(b)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI keyword suggestions for review
// @route   GET /api/reviews/suggestions/:orderId
const getKeywordSuggestions = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('restaurant', 'name cuisineType');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const suggestions = generateKeywordSuggestions(
      order.items,
      order.restaurant?.cuisineType?.join(' ') || ''
    );

    const prompts = [
      `Describe the taste and texture of the food you ordered`,
      `How was the delivery speed and packaging?`,
      `Would you recommend this restaurant to a friend? Why?`,
      `What made your dining experience memorable?`,
    ];

    res.json({ success: true, suggestions, prompts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant reviews
// @route   GET /api/reviews/restaurant/:restaurantId
const getRestaurantReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = sort === 'helpful' ? { helpfulCount: -1 } : { createdAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find({ restaurant: req.params.restaurantId })
        .populate('user', 'name avatar loyaltyPoints badges totalReviews')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ restaurant: req.params.restaurantId }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const userId = req.user.userId;
    const alreadyVoted = review.helpfulVotes.includes(userId);

    if (alreadyVoted) {
      review.helpfulVotes = review.helpfulVotes.filter((id) => id.toString() !== userId);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulVotes.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();
    res.json({ success: true, helpfulCount: review.helpfulCount, voted: !alreadyVoted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getKeywordSuggestions, getRestaurantReviews, markHelpful };
