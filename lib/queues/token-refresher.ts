import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const TOKEN_REFRESHER_QUEUE_NAME = 'token-refresher';

export interface TokenRefresherJobData {
  // Can be empty, runs periodically to check all tokens
}

export const tokenRefresherQueue = new Queue<TokenRefresherJobData>(TOKEN_REFRESHER_QUEUE_NAME, {
  connection,
});

export const createTokenRefresherWorker = (
  processor: (job: Job<TokenRefresherJobData>) => Promise<void>
) => {
  return new Worker<TokenRefresherJobData>(TOKEN_REFRESHER_QUEUE_NAME, processor, {
    connection,
  });
};
