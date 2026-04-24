import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const COMMENT_POLLER_QUEUE_NAME = 'comment-poller';

export interface CommentPollerJobData {
  // Empty or could contain specific rule IDs to poll
}

export const commentPollerQueue = new Queue<CommentPollerJobData>(COMMENT_POLLER_QUEUE_NAME, {
  connection,
});

export const createCommentPollerWorker = (
  processor: (job: Job<CommentPollerJobData>) => Promise<void>
) => {
  return new Worker<CommentPollerJobData>(COMMENT_POLLER_QUEUE_NAME, processor, {
    connection,
  });
};
