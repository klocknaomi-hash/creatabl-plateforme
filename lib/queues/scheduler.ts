import { tokenRefresherQueue } from './token-refresher';

export async function setupScheduledJobs() {
  // Add a repeatable job to refresh tokens every hour
  await tokenRefresherQueue.add(
    'periodic-token-refresh',
    {},
    {
      repeat: {
        pattern: '0 * * * *', // Every hour
      },
    }
  );
  console.log('Scheduled periodic token refresh job');
}
