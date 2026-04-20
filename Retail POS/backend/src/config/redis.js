const Redis = require('ioredis');
const { REDIS_URL } = require('./env');

let redis = null;

try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy: () => null,
  });

  redis.connect().catch(() => {
    console.warn('Redis not available. Continuing without cache.');
    redis = null;
  });
} catch (error) {
  console.warn('Redis initialization failed. Continuing without cache.');
  redis = null;
}

module.exports = redis;