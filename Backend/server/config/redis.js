import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

export default redisClient;
