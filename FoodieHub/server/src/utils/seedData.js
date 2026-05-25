const Restaurant = require('../models/Restaurant');

// Seed data for demonstration
const seedRestaurants = async () => {
  const count = await Restaurant.countDocuments();
  if (count > 0) {
    console.log('📊 Database already has data, skipping seed');
    return;
  }

  const User = require('../models/User');
  let owner = await User.findOne({ role: 'restaurant' });
  if (!owner) {
    owner = await User.create({
      name: 'Demo Owner',
      email: 'owner@foodapp.com',
      password: 'password123',
      role: 'restaurant',
    });
  }

  let consumer = await User.findOne({ email: 'user@foodapp.com' });

  if (!consumer) {
    consumer = await User.create({
      name: 'Demo User',
      email: 'user@foodapp.com',
      password: 'password123',
      role: 'consumer',
    });
  }
  const restaurants = [
    {
      name: 'Spice Garden',
      description: 'Authentic North Indian cuisine with rich gravies and tandoor specialties',
      owner: owner._id,
      email: 'spicegarden@restaurant.com',
      phone: '+91-9876543210',
      cuisineType: ['North Indian', 'Mughlai'],
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      address: { street: '42 MG Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001' },
      location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bangalore
      rating: 4.3, totalRatings: 128, priceRange: '$$',
      features: { delivery: true, dineIn: true, tableReservation: true, events: false },
      deliveryInfo: { minOrderAmount: 200, deliveryFee: 40, estimatedTime: 35, deliveryRadius: 8 },
      isVerified: true,
      menu: [
        { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 320, category: 'Main Course', isAvailable: true, isVeg: false, spiceLevel: 'medium', preparationTime: 25, tags: ['popular', 'bestseller'] },
        { name: 'Paneer Tikka Masala', description: 'Cottage cheese in rich spiced gravy', price: 280, category: 'Main Course', isAvailable: true, isVeg: true, spiceLevel: 'medium', preparationTime: 20 },
        { name: 'Garlic Naan', description: 'Soft leavened bread with garlic butter', price: 60, category: 'Breads', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 10 },
        { name: 'Dal Makhani', description: 'Slow-cooked black lentils in buttery gravy', price: 220, category: 'Main Course', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 30 },
        { name: 'Biryani (Chicken)', description: 'Aromatic long-grain rice with spiced chicken', price: 380, category: 'Rice', isAvailable: true, isVeg: false, spiceLevel: 'hot', preparationTime: 40, tags: ['weekend special'] },
        { name: 'Gulab Jamun', description: 'Soft milk solids dumpling in sugar syrup', price: 120, category: 'Desserts', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 5 },
      ],
      tables: [
        { tableNumber: 1, capacity: 2, isAvailable: true },
        { tableNumber: 2, capacity: 4, isAvailable: true },
        { tableNumber: 3, capacity: 6, isAvailable: true },
        { tableNumber: 4, capacity: 8, isAvailable: false },
      ],
    },
    {
      name: 'Pizza Planet',
      description: 'Authentic Italian pizzas with hand-tossed crusts and premium toppings',
      owner: owner._id,
      email: 'pizzaplanet@restaurant.com',
      phone: '+91-9876543211',
      cuisineType: ['Italian', 'Pizza', 'Continental'],
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      coverImage: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=800',
      address: { street: '15 Koramangala 4th Block', city: 'Bangalore', state: 'Karnataka', zipCode: '560034' },
      location: { type: 'Point', coordinates: [77.6245, 12.9279] },
      rating: 4.5, totalRatings: 256, priceRange: '$$',
      features: { delivery: true, dineIn: true, tableReservation: true, events: false },
      deliveryInfo: { minOrderAmount: 300, deliveryFee: 30, estimatedTime: 30, deliveryRadius: 6 },
      isVerified: true,
      menu: [
        { name: 'Margherita Pizza', description: 'Classic tomato sauce with fresh mozzarella and basil', price: 350, category: 'Pizzas', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 20, tags: ['bestseller', 'classic'] },
        { name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce with grilled chicken and caramelized onions', price: 450, category: 'Pizzas', isAvailable: true, isVeg: false, spiceLevel: 'mild', preparationTime: 25 },
        { name: 'Penne Arrabiata', description: 'Penne pasta in spicy tomato sauce', price: 280, category: 'Pasta', isAvailable: true, isVeg: true, spiceLevel: 'hot', preparationTime: 15 },
        { name: 'Caesar Salad', description: 'Romaine lettuce with caesar dressing and croutons', price: 220, category: 'Salads', isAvailable: true, isVeg: false, spiceLevel: 'mild', preparationTime: 10 },
        { name: 'Garlic Bread', description: 'Toasted baguette with herb butter and garlic', price: 150, category: 'Starters', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 10 },
        { name: 'Tiramisu', description: 'Classic Italian dessert with espresso-soaked ladyfingers', price: 200, category: 'Desserts', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 5 },
      ],
      tables: [
        { tableNumber: 1, capacity: 2, isAvailable: true },
        { tableNumber: 2, capacity: 4, isAvailable: true },
        { tableNumber: 3, capacity: 4, isAvailable: true },
        { tableNumber: 4, capacity: 6, isAvailable: false },
        { tableNumber: 5, capacity: 10, isAvailable: true },
      ],
    },
    {
      name: 'Dragon Wok',
      description: 'Authentic Chinese and Pan-Asian cuisine with fresh wok-tossed dishes',
      owner: owner._id,
      email: 'dragonwok@restaurant.com',
      phone: '+91-9876543212',
      cuisineType: ['Chinese', 'Thai', 'Asian'],
      image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
      coverImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
      address: { street: '78 Indiranagar 100 Feet Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560038' },
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      rating: 4.1, totalRatings: 89, priceRange: '$$$',
      features: { delivery: true, dineIn: true, tableReservation: true, events: true },
      deliveryInfo: { minOrderAmount: 400, deliveryFee: 50, estimatedTime: 45, deliveryRadius: 5 },
      isVerified: true,
      menu: [
        { name: 'Dim Sum Platter', description: 'Assorted steamed dumplings with dipping sauces', price: 320, category: 'Starters', isAvailable: true, isVeg: false, spiceLevel: 'mild', preparationTime: 20, tags: ['popular'] },
        { name: 'Kung Pao Chicken', description: 'Stir-fried chicken with peanuts and chili peppers', price: 380, category: 'Main Course', isAvailable: true, isVeg: false, spiceLevel: 'hot', preparationTime: 20 },
        { name: 'Vegetable Fried Rice', description: 'Wok-tossed rice with mixed vegetables and soy sauce', price: 250, category: 'Rice', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 15 },
        { name: 'Tom Yum Soup', description: 'Spicy and sour Thai soup with mushrooms and lemongrass', price: 220, category: 'Soups', isAvailable: true, isVeg: false, spiceLevel: 'extra-hot', preparationTime: 15 },
        { name: 'Hakka Noodles', description: 'Hand-pulled noodles with vegetables in umami sauce', price: 240, category: 'Noodles', isAvailable: true, isVeg: true, spiceLevel: 'medium', preparationTime: 15 },
        { name: 'Mango Pudding', description: 'Silky mango pudding with coconut cream', price: 160, category: 'Desserts', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 5 },
      ],
      tables: [
        { tableNumber: 1, capacity: 2, isAvailable: true },
        { tableNumber: 2, capacity: 4, isAvailable: false },
        { tableNumber: 3, capacity: 6, isAvailable: true },
        { tableNumber: 4, capacity: 8, isAvailable: true },
      ],
    },
    {
      name: 'South Spice',
      description: 'Traditional South Indian breakfast and meals with authentic recipes',
      owner: owner._id,
      email: 'southspice@restaurant.com',
      phone: '+91-9876543213',
      cuisineType: ['South Indian', 'Kerala', 'Tamil'],
      image: 'https://images.unsplash.com/photo-1562565651-6f312ef73a0a?w=400',
      coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
      address: { street: '33 Jayanagar 4th Block', city: 'Bangalore', state: 'Karnataka', zipCode: '560011' },
      location: { type: 'Point', coordinates: [77.5836, 12.9261] },
      rating: 4.7, totalRatings: 342, priceRange: '$',
      features: { delivery: true, dineIn: true, tableReservation: false, events: false },
      deliveryInfo: { minOrderAmount: 100, deliveryFee: 20, estimatedTime: 25, deliveryRadius: 10 },
      isVerified: true,
      menu: [
        { name: 'Masala Dosa', description: 'Crispy rice crepe with spiced potato filling and chutneys', price: 120, category: 'Breakfast', isAvailable: true, isVeg: true, spiceLevel: 'medium', preparationTime: 15, tags: ['bestseller', 'breakfast'] },
        { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup and chutneys', price: 80, category: 'Breakfast', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 10 },
        { name: 'Kerala Fish Curry', description: 'Spicy coconut milk-based fish curry with kudampuli', price: 320, category: 'Main Course', isAvailable: true, isVeg: false, spiceLevel: 'hot', preparationTime: 30 },
        { name: 'Bisi Bele Bath', description: 'Spiced rice and lentil dish with vegetables', price: 150, category: 'Main Course', isAvailable: true, isVeg: true, spiceLevel: 'medium', preparationTime: 20 },
        { name: 'Filter Coffee', description: 'Authentic South Indian decoction coffee with milk', price: 50, category: 'Beverages', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 5 },
        { name: 'Payasam', description: 'Sweet rice pudding with cardamom and cashews', price: 100, category: 'Desserts', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 5 },
      ],
      tables: [
        { tableNumber: 1, capacity: 4, isAvailable: true },
        { tableNumber: 2, capacity: 4, isAvailable: true },
        { tableNumber: 3, capacity: 6, isAvailable: true },
      ],
    },
    {
      name: 'The Burger Lab',
      description: 'Gourmet burgers crafted with premium ingredients and secret house sauces',
      owner: owner._id,
      email: 'burgerlab@restaurant.com',
      phone: '+91-9876543214',
      cuisineType: ['American', 'Burgers', 'Fast Food'],
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      coverImage: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800',
      address: { street: '7 HSR Layout Sector 6', city: 'Bangalore', state: 'Karnataka', zipCode: '560102' },
      location: { type: 'Point', coordinates: [77.6309, 12.9116] },
      rating: 4.4, totalRatings: 187, priceRange: '$$',
      features: { delivery: true, dineIn: true, tableReservation: false, events: false },
      deliveryInfo: { minOrderAmount: 250, deliveryFee: 35, estimatedTime: 30, deliveryRadius: 7 },
      isVerified: true,
      menu: [
        { name: 'Classic Smash Burger', description: 'Double smash patty with American cheese and special sauce', price: 320, category: 'Burgers', isAvailable: true, isVeg: false, spiceLevel: 'mild', preparationTime: 15, tags: ['bestseller'] },
        { name: 'Crispy Chicken Burger', description: 'Southern-fried chicken with coleslaw and honey mustard', price: 280, category: 'Burgers', isAvailable: true, isVeg: false, spiceLevel: 'medium', preparationTime: 15 },
        { name: 'Mushroom Swiss Burger', description: 'Sautéed mushrooms with swiss cheese and truffle aioli', price: 350, category: 'Burgers', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 15 },
        { name: 'Loaded Fries', description: 'Crispy fries with cheese sauce, jalapeños, and sour cream', price: 180, category: 'Sides', isAvailable: true, isVeg: true, spiceLevel: 'medium', preparationTime: 10 },
        { name: 'Onion Rings', description: 'Beer-battered onion rings with ranch dip', price: 150, category: 'Sides', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 10 },
        { name: 'Chocolate Shake', description: 'Thick milkshake with Belgian chocolate and whipped cream', price: 200, category: 'Beverages', isAvailable: true, isVeg: true, spiceLevel: 'mild', preparationTime: 5 },
      ],
      tables: [
        { tableNumber: 1, capacity: 2, isAvailable: true },
        { tableNumber: 2, capacity: 4, isAvailable: true },
        { tableNumber: 3, capacity: 4, isAvailable: false },
      ],
    },
  ];

  await Restaurant.insertMany(restaurants);
  console.log(`✅ Seeded ${restaurants.length} restaurants with menu items and tables`);
};

module.exports = seedRestaurants;
