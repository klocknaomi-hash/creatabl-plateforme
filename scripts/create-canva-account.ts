import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('Creating Clerk user...');
  const res = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email_address: ['integrations-support@canva.com'],
      password: 'CanvaReview2026!',
      skip_password_checks: true,
      skip_password_requirement: true
    })
  });
  
  const data = await res.json();
  let clerkId;
  
  if (!res.ok) {
    if (data.errors && data.errors[0]?.code === 'form_identifier_exists') {
      console.log('User already exists in Clerk. Fetching...');
      const searchRes = await fetch('https://api.clerk.com/v1/users?email_address=integrations-support@canva.com', {
        headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` }
      });
      const searchData = await searchRes.json();
      if (searchData.length > 0) {
        clerkId = searchData[0].id;
        
        console.log('Updating password...');
        await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: 'CanvaReview2026!',
            skip_password_checks: true
          })
        });
      } else {
        console.error('Could not find user in Clerk after form_identifier_exists error.');
        return;
      }
    } else {
      console.error('Clerk error:', data);
      return;
    }
  } else {
    clerkId = data.id;
  }
  
  console.log('Clerk user ID:', clerkId);
  
  console.log('Inserting/Updating Neon database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await pool.query(`
      INSERT INTO users (
        clerk_id,
        email,
        plan,
        subscription_status,
        onboarding_completed,
        client_type,
        trial_ends_at,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW() + INTERVAL '30 days', NOW(), NOW()
      )
      ON CONFLICT (clerk_id) DO UPDATE SET
        plan = 'pro',
        subscription_status = 'active',
        onboarding_completed = true
    `, [
      clerkId,
      'integrations-support@canva.com',
      'pro',
      'active',
      true,
      'business'
    ]);
    console.log('Database user created successfully.');
  } catch (err: any) {
    console.error('Neon Error:', err.message);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
