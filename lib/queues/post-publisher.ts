import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const POST_PUBLISHER_QUEUE_NAME = 'post-publisher';

export interface PostPublisherJobData {
  postId: string;
}

export const postPublisherQueue = new Queue<PostPublisherJobData>(POST_PUBLISHER_QUEUE_NAME, {
  connection,
});

export const createPostPublisherWorker = (
  processor: (job: Job<PostPublisherJobData>) => Promise<void>
) => {
  return new Worker<PostPublisherJobData>(POST_PUBLISHER_QUEUE_NAME, processor, {
    connection,
  });
};
