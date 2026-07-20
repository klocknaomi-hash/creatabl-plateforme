require('dotenv').config({ path: '.env.local' });
const { getCachedAccounts, getDashboardStats } = require('./lib/dashboard-data');

async function run() {
  const clerkId = 'user_3CqC4wiXjZAh1jXUm7C7A3O3k7k';
  console.log("Fetching accounts...");
  const accounts = await getCachedAccounts(clerkId);
  console.log("Accounts:", accounts);

  console.log("Fetching stats...");
  const stats = await getDashboardStats(clerkId);
  console.log("Stats:", stats);
}
run().catch(console.error);
