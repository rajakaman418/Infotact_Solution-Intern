require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User');
const Store = require('../models/Store');

async function seed() {
  await connectDB();

  const store = await Store.findOneAndUpdate(
    { code: 'MAIN01' },
    {
      name: 'Main Store',
      code: 'MAIN01',
      type: 'retail',
      address: 'Demo Address',
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: 'admin@example.com' },
    {
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'system_admin',
      storeId: store._id,
    },
    { upsert: true, new: true, runValidators: true }
  );

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
