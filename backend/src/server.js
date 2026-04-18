require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
require('./config/redis');
const { PORT } = require('./config/env');

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();