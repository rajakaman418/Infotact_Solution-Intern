const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// Simulate payment processing
const simulatePayment = async (amount, method) => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate latency
  return {
    success: true,
    transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    amount,
    method,
    timestamp: new Date(),
  };
};

// @desc    Create new order (delivery or reservation)
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const {
      restaurantId, type, items, deliveryAddress,
      reservationDetails, paymentMethod = 'card', specialInstructions,
    } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    // Validate items and compute pricing
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = restaurant.menu.id(item.menuItemId);
      if (!menuItem) return res.status(400).json({ success: false, message: `Item ${item.menuItemId} not found` });
      if (!menuItem.isAvailable) return res.status(400).json({ success: false, message: `${menuItem.name} is currently unavailable` });

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        image: menuItem.image,
        specialInstructions: item.specialInstructions || '',
      });
    }

    const deliveryFee = type === 'delivery' ? restaurant.deliveryInfo.deliveryFee : 0;
    const taxes = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const totalAmount = subtotal + deliveryFee + taxes;

    // Simulate payment
    const payment = await simulatePayment(totalAmount, paymentMethod);
    if (!payment.success) {
      return res.status(402).json({ success: false, message: 'Payment failed. Please try again.' });
    }

    // Create order
    const order = await Order.create({
      user: req.user.userId,
      restaurant: restaurantId,
      type,
      items: validatedItems,
      deliveryAddress: type === 'delivery' ? deliveryAddress : undefined,
      reservationDetails: type === 'reservation' || type === 'dine-in' ? reservationDetails : undefined,
      subtotal,
      deliveryFee,
      taxes,
      totalAmount,
      paymentStatus: 'paid',
      paymentMethod,
      transactionId: payment.transactionId,
      specialInstructions,
      status: 'PENDING',
      statusHistory: [{ status: 'PENDING', timestamp: new Date(), note: 'Order placed' }],
    });

    // Notify via WebSocket (will be emitted from socket handler)
    if (req.io) {
      req.io.to(`restaurant_${restaurantId}`).emit('NEW_ORDER', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        type: order.type,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'name image address phone')
      .populate('user', 'name email phone');

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
const getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { user: req.user.userId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('restaurant', 'name image address cuisineType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image address phone location')
      .populate('user', 'name email phone')
      .populate('courier', 'name phone');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Authorization check
    const isOwner = order.user._id.toString() === req.user.userId;
    const isCourier = order.courier && order.courier._id.toString() === req.user.userId;
    if (!isOwner && !isCourier) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (restaurant/courier)
// @route   PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, courierLocation } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const validTransitions = {
      PENDING: ['ACCEPTED', 'REJECTED'],
      ACCEPTED: ['ORDER_PREPARING'],
      ORDER_PREPARING: ['READY_FOR_PICKUP'],
      READY_FOR_PICKUP: ['COURIER_ASSIGNED'],
      COURIER_ASSIGNED: ['IN_TRANSIT'],
      IN_TRANSIT: ['DELIVERED'],
      DELIVERED: ['COMPLETED'],
    };

    if (validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${order.status} to ${status}` });
    }

    order.status = status;
    if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
    if (status === 'DELIVERED') order.actualDeliveryTime = new Date();
    if (courierLocation) order.courierLocation = courierLocation;

    await order.save();

    // Broadcast WebSocket event
    if (req.io) {
      req.io.to(`order_${order._id}`).emit('ORDER_STATUS_UPDATE', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        timestamp: new Date(),
        courierLocation: order.courierLocation,
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant orders (merchant dashboard)
// @route   GET /api/orders/restaurant/:restaurantId
const getRestaurantOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { restaurant: req.params.restaurantId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .populate('courier', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get daily revenue analytics
// @route   GET /api/orders/restaurant/:restaurantId/analytics
const getRestaurantAnalytics = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const analytics = await Order.aggregate([
      {
        $match: {
          restaurant: require('mongoose').Types.ObjectId.createFromHexString(req.params.restaurantId),
          status: { $in: ['DELIVERED', 'COMPLETED'] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const summary = await Order.aggregate([
      {
        $match: {
          restaurant: require('mongoose').Types.ObjectId.createFromHexString(req.params.restaurantId),
          status: { $in: ['DELIVERED', 'COMPLETED'] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    res.json({ success: true, data: { daily: analytics, summary: summary[0] || {} } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getUserOrders, getOrder, updateOrderStatus, getRestaurantOrders, getRestaurantAnalytics };
