function requireEnv(name) {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function validateMongoUri(uri) {
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://');
  }

  if (uri.includes('cluster0..') || uri.includes('..mongodb.net')) {
    throw new Error('MONGO_URI appears malformed: found consecutive dots in MongoDB host');
  }

  if (uri.includes(' ')) {
    throw new Error('MONGO_URI must not contain spaces');
  }
}

function validateRedisUrl(url) {
  if (!url.startsWith('redis://')) {
    throw new Error('REDIS_URL must start with redis://');
  }
}

const env = {
  PORT: process.env.PORT || '5000',
  MONGO_URI: requireEnv('MONGO_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  REDIS_URL: requireEnv('REDIS_URL'),
};

validateMongoUri(env.MONGO_URI);
validateRedisUrl(env.REDIS_URL);

module.exports = env;