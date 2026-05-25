const jwt = require('jsonwebtoken');

const socketHandler = (io) => {
  // Middleware for socket authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Join order tracking room
    socket.on('JOIN_ORDER_ROOM', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`📦 User ${socket.userId} joined order room: ${orderId}`);
    });

    // Leave order tracking room
    socket.on('LEAVE_ORDER_ROOM', (orderId) => {
      socket.leave(`order_${orderId}`);
    });

    // Join restaurant dashboard room (for merchants)
    socket.on('JOIN_RESTAURANT_ROOM', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`🏪 User ${socket.userId} joined restaurant room: ${restaurantId}`);
    });

    // Courier sends live GPS location updates
    socket.on('COURIER_LOCATION_UPDATE', async (data) => {
      const { orderId, coordinates } = data;
      // Broadcast to all in the order room (customer + restaurant)
      io.to(`order_${orderId}`).emit('COURIER_LOCATION', {
        orderId,
        coordinates, // [lng, lat]
        timestamp: new Date(),
      });
    });

    // Order status update from merchant
    socket.on('MERCHANT_STATUS_UPDATE', (data) => {
      const { orderId, status, orderNumber } = data;
      io.to(`order_${orderId}`).emit('ORDER_STATUS_UPDATE', {
        orderId,
        orderNumber,
        status,
        timestamp: new Date(),
      });
    });

    // Typing/live notification events
    socket.on('PING', () => socket.emit('PONG', { timestamp: new Date() }));

    socket.on('disconnect', (reason) => {
      console.log(`🔴 Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`❌ Socket error for ${socket.id}:`, err.message);
    });
  });

  // Handle reconnection gracefully
  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err.req, err.code, err.message);
  });
};

module.exports = socketHandler;
