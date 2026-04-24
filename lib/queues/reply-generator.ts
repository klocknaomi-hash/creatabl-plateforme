import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const REPLY_GENERATOR_QUEUE_NAME = 'reply-generator';

export interface ReplyGeneratorJobData {
  replyQueueId: string;
}

export const replyGeneratorQueue = new Queue<ReplyGeneratorJobData>(REPLY_GENERATOR_QUEUE_NAME, {
  connection,
});

export const createReplyGeneratorWorker = (
  processor: (job: Job<ReplyGeneratorJobData>) => Promise<void>
) => {
  return new Worker<ReplyGeneratorJobData>(REPLY_GENERATOR_QUEUE_NAME, processor, {
    connection,
  });
};
