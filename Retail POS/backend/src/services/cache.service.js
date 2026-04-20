const redis = require('../config/redis');

async function getJSON(key) {
  if (!redis) return null;
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
}

async function setJSON(key, payload, ttlSeconds = 60) {
  if (!redis) return;
  await redis.set(key, JSON.stringify(payload), 'EX', ttlSeconds);
}

async function invalidatePattern(pattern) {
  if (!redis) return;
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(...keys);
}

module.exports = { getJSON, setJSON, invalidatePattern };
