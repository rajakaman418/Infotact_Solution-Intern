const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create 2dsphere index for geospatial queries
    const db = mongoose.connection.db;
    await db.collection('restaurants').createIndex({ location: '2dsphere' }).catch(() => {});
    console.log('✅ Geospatial index ready');
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
