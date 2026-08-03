import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
async function main() {
  const { clerkClient } = await import('@clerk/nextjs/server');
  const client = await clerkClient();
  const res = await client.users.getUserList({});
  console.log(res.data.map(u => u.emailAddresses[0]?.emailAddress));
  process.exit(0);
}
main();
