import { chromium } from '@playwright/test';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const email = 'blog.outfit.fr@gmail.com';
  console.log(`[1] Starting tests for ${email}`);
  
  // Get user ID
  const userRows = await db.select().from(users).where(eq(users.email, email));
  const user = userRows[0];
  const clerkUserId = user.clerkId;
  
  // Generate magic link
  const client = await clerkClient();
  const ticket = await client.signInTokens.createSignInToken({
    userId: clerkUserId,
    expiresInSeconds: 600
  });
  
  const loginUrl = ticket.url;
  console.log(`Login URL: ${loginUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("[2] Logging in...");
  await page.goto(loginUrl);
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
  console.log("Logged in!");

  // Verify dashboard is empty
  console.log("[3] Taking dashboard screenshot...");
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `/Users/naomiklock/.gemini/antigravity-ide/brain/7267a37a-fe29-4026-8e73-ad1e4071683d/dashboard_empty_${Date.now()}.png` });

  // Navigate to projects
  console.log("[4] Taking projects screenshot...");
  await page.goto('http://localhost:3000/dashboard/projects');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `/Users/naomiklock/.gemini/antigravity-ide/brain/7267a37a-fe29-4026-8e73-ad1e4071683d/projects_empty_${Date.now()}.png` });

  // Navigate to members
  console.log("[5] Taking members screenshot...");
  await page.goto('http://localhost:3000/dashboard/settings/members');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `/Users/naomiklock/.gemini/antigravity-ide/brain/7267a37a-fe29-4026-8e73-ad1e4071683d/members_${Date.now()}.png` });

  console.log("Done verifying empty state.");
  
  await browser.close();
}

main().catch(console.error);
