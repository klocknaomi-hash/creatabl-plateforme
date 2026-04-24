import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const REPLY_POSTER_QUEUE_NAME = 'reply-poster';

export interface ReplyPosterJobData {
  replyQueueId: string;
}

export const replyPosterQueue = new Queue<ReplyPosterJobData>(REPLY_POSTER_QUEUE_NAME, {
  connection,
});

export const createReplyPosterWorker = (
  processor: (job: Job<ReplyPosterJobData>) => Promise<void>
) => {
  return new Worker<ReplyPosterJobData>(REPLY_POSTER_QUEUE_NAME, processor, {
    connection,
  });
};
