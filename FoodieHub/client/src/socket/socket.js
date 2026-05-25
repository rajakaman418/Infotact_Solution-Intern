import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(window.location.origin, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
  socket.on('disconnect', (reason) => console.log('🔴 Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('❌ Socket error:', err.message));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinOrderRoom = (orderId) => socket?.emit('JOIN_ORDER_ROOM', orderId);
export const leaveOrderRoom = (orderId) => socket?.emit('LEAVE_ORDER_ROOM', orderId);
export const joinRestaurantRoom = (restaurantId) => socket?.emit('JOIN_RESTAURANT_ROOM', restaurantId);
export const sendCourierLocation = (orderId, coordinates) =>
  socket?.emit('COURIER_LOCATION_UPDATE', { orderId, coordinates });
