import * as dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '../.env.local') })

async function test() {
  const { db } = await import('../lib/db')
  const { users } = await import('../lib/db/schema')

  try {
    const result = await db.select().from(users).limit(1)
    console.log('✅ DB connection works')
    console.log('Columns available:', Object.keys(result[0] || {}))
  } catch (error) {
    console.error('❌ DB connection failed:', error)
  }
}

test().catch(console.error)
