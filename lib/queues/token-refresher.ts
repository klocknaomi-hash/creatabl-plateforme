import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = process.env.REDIS_URL 
  ? new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  : null;

export const TOKEN_REFRESHER_QUEUE_NAME = 'token-refresher';

export interface TokenRefresherJobData {
  // Can be empty, runs periodically to check all tokens
}

export const tokenRefresherQueue = connection 
  ? new Queue<TokenRefresherJobData>(TOKEN_REFRESHER_QUEUE_NAME, {
      connection,
    })
  : { 
      add: async () => { 
        console.warn('Redis not configured, skipping token-refresher job'); 
        return { id: 'mock-id' } as any; 
      } 
    } as unknown as Queue<TokenRefresherJobData>;

export const createTokenRefresherWorker = (
  processor: (job: Job<TokenRefresherJobData>) => Promise<void>
) => {
  if (!connection) {
    console.warn('Redis not configured, worker not created');
    return null;
  }
  return new Worker<TokenRefresherJobData>(TOKEN_REFRESHER_QUEUE_NAME, processor, {
    connection,
  });
};
