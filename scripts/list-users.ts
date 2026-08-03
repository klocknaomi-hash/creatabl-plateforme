import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { dbTransactional: db } = await import("../lib/db/index.js");
  const { users } = await import("../lib/db/schema.js");
  const allUsers = await db.select().from(users);
  console.log(allUsers.map((u: any) => u.email));
  process.exit(0);
}
main();
