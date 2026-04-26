export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createPostPublisherWorker } = await import('./lib/queues/post-publisher');
    const { processPostPublisherJob } = await import('./lib/queues/post-publisher-logic');
    
    const { createTokenRefresherWorker } = await import('./lib/queues/token-refresher');
    const { processTokenRefresh } = await import('./lib/queues/token-refresher-logic');

    // Initialize Post Publisher Worker
    createPostPublisherWorker(processPostPublisherJob);
    console.log('Post Publisher Worker initialized');

    // Initialize Token Refresher Worker
    createTokenRefresherWorker(processTokenRefresh);
    console.log('Token Refresher Worker initialized');
  }
}
