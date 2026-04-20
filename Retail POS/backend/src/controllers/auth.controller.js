const User = require('../models/User');
const { signToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  const { name, email, password, role, storeId } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    storeId: storeId || null,
  });

  const token = signToken({
    userId: user._id,
    role: user.role,
    storeId: user.storeId || null,
  });

  res.status(201).json({
    message: 'User created',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({
    userId: user._id,
    role: user.role,
    storeId: user.storeId || null,
  });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    },
  });
};

exports.getMe = async (req, res) => {
  res.json({
    user: req.user,
  });
};