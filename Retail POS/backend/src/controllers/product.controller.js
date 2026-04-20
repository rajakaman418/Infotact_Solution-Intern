const Product = require('../models/Product');
const redis = require('../config/redis');

exports.listProducts = async (req, res) => {
  const {
    q = '',
    category,
    brand,
    isActive = 'true',
    page = 1,
    limit = 10,
  } = req.query;

  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (parsedPage - 1) * parsedLimit;

  const filter = {};

  if (isActive !== 'all') {
    filter.isActive = isActive === 'true';
  }

  if (category) {
    filter.category = category;
  }

  if (brand) {
    filter.brand = brand;
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      { 'variants.sku': { $regex: q, $options: 'i' } },
    ];
  }

  const cacheKey = `products:${JSON.stringify({
    q,
    category,
    brand,
    isActive,
    page: parsedPage,
    limit: parsedLimit,
  })}`;

  let cached = null;
  if (redis) {
    try {
      cached = await redis.get(cacheKey);
    } catch (error) {
      console.warn('Redis get failed:', error.message);
    }
  }

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const [items, totalItems] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Product.countDocuments(filter),
  ]);

  const payload = {
    items,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      totalItems,
      totalPages: Math.ceil(totalItems / parsedLimit),
      hasNextPage: parsedPage * parsedLimit < totalItems,
      hasPrevPage: parsedPage > 1,
    },
    filters: {
      q,
      category: category || null,
      brand: brand || null,
      isActive,
    },
  };

  if (redis) {
    try {
      await redis.set(cacheKey, JSON.stringify(payload), 'EX', 60);
    } catch (error) {
      console.warn('Redis set failed:', error.message);
    }
  }

  return res.json(payload);
};

exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);

  if (redis) {
    try {
      const keys = await redis.keys('products:*');
      if (keys.length) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn('Redis cache clear failed:', error.message);
    }
  }

  res.status(201).json(product);
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (redis) {
    try {
      const keys = await redis.keys('products:*');
      if (keys.length) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn('Redis cache clear failed:', error.message);
    }
  }

  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (redis) {
    try {
      const keys = await redis.keys('products:*');
      if (keys.length) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn('Redis cache clear failed:', error.message);
    }
  }

  res.json({ message: 'Product archived' });
};