import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = process.env.REDIS_URL 
  ? new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  : null;

export const POST_PUBLISHER_QUEUE_NAME = 'post-publisher';

export interface PostPublisherJobData {
  postId: string;
}

export const postPublisherQueue = connection 
  ? new Queue<PostPublisherJobData>(POST_PUBLISHER_QUEUE_NAME, {
      connection,
    })
  : { 
      add: async () => { 
        console.warn('Redis not configured, skipping post-publisher job'); 
        return { id: 'mock-id' } as any; 
      } 
    } as unknown as Queue<PostPublisherJobData>;

export const createPostPublisherWorker = (
  processor: (job: Job<PostPublisherJobData>) => Promise<void>
) => {
  if (!connection) {
    console.warn('Redis not configured, worker not created');
    return null;
  }
  return new Worker<PostPublisherJobData>(POST_PUBLISHER_QUEUE_NAME, processor, {
    connection,
  });
};
