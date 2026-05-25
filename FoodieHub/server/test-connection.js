// Quick connection test script - run with: node test-connection.js
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('Trying URI (masked):', uri.replace(/:[^@]+@/, ':***@'));

mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log('✅ Connected successfully!');
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    console.error('Code:', err.code);
    process.exit(1);
  });
