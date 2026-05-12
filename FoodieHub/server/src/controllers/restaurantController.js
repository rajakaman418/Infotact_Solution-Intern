const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Geospatial search - find nearby restaurants using $geoNear
// @route   GET /api/restaurants/nearby
const getNearbyRestaurants = async (req, res) => {
  try {
    const {
      lat, lng,
      maxDistance = 10000, // meters (10km default)
      cuisine,
      minRating,
      priceRange,
      features,
      page = 1,
      limit = 10,
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build $geoNear pipeline
    const geoNearStage = {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: 'distance',
        maxDistance: parseInt(maxDistance),
        spherical: true,
        query: { isActive: true },
      },
    };

    const pipeline = [geoNearStage];

    // Additional filters
    const matchFilters = {};
    if (cuisine) matchFilters.cuisineType = { $in: cuisine.split(',') };
    if (minRating) matchFilters.rating = { $gte: parseFloat(minRating) };
    if (priceRange) matchFilters.priceRange = { $in: priceRange.split(',') };
    if (features === 'delivery') matchFilters['features.delivery'] = true;
    if (features === 'dineIn') matchFilters['features.dineIn'] = true;
    if (features === 'reservation') matchFilters['features.tableReservation'] = true;

    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({ $match: matchFilters });
    }

    // Sort by composite score: distance + rating weight
    pipeline.push({
      $addFields: {
        compositeScore: {
          $subtract: [
            { $multiply: ['$rating', 2000] },
            { $divide: ['$distance', 100] },
          ],
        },
      },
    });

    pipeline.push({ $sort: { compositeScore: -1 } });

    // Count total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Restaurant.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Paginate
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Project fields
    pipeline.push({
      $project: {
        name: 1, description: 1, cuisineType: 1, image: 1, coverImage: 1,
        address: 1, location: 1, rating: 1, totalRatings: 1, priceRange: 1,
        features: 1, deliveryInfo: 1, openingHours: 1, isVerified: 1,
        distance: 1, compositeScore: 1,
      },
    });

    const restaurants = await Restaurant.aggregate(pipeline);

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single restaurant with full menu
// @route   GET /api/restaurants/:id
const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all restaurants (search/filter)
// @route   GET /api/restaurants
const getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, minRating, priceRange, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { isActive: true };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (cuisine) query.cuisineType = { $in: cuisine.split(',') };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (priceRange) query.priceRange = { $in: priceRange.split(',') };

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).skip(skip).limit(parseInt(limit)).sort({ rating: -1 }),
      Restaurant.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: restaurants,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create restaurant (restaurant owner)
// @route   POST /api/restaurants
const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create({ ...req.body, owner: req.user.userId });
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant (owner only)
// @route   PUT /api/restaurants/:id
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found or unauthorized' });

    Object.assign(restaurant, req.body, { updatedAt: new Date() });
    await restaurant.save();
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/restaurants/:id/menu/:itemId/toggle
const toggleMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Unauthorized' });

    const item = restaurant.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

    item.isAvailable = !item.isAvailable;
    await restaurant.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add menu item
// @route   POST /api/restaurants/:id/menu
const addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Unauthorized' });

    restaurant.menu.push(req.body);
    await restaurant.save();
    res.status(201).json({ success: true, data: restaurant.menu[restaurant.menu.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant by owner
// @route   GET /api/restaurants/my-restaurant
const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.userId });
    if (!restaurant) return res.status(404).json({ success: false, message: 'No restaurant found' });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNearbyRestaurants,
  getRestaurant,
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  toggleMenuItem,
  addMenuItem,
  getMyRestaurant,
};
