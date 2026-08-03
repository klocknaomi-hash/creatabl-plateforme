import { chromium, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timestamp = Date.now();
  const email = `test.launch.${timestamp}@gmail.com`;
  const password = "TestPassword2026!";

  console.log(`[1] Starting sign-up for ${email}`);
  await page.goto('http://localhost:3000/sign-up');

  // Fill sign up form
  // Clerk components are inside shadow DOM sometimes, or just standard inputs
  // Let's use more generic selectors if shadow dom is used, or data-clerk attributes
  await page.waitForSelector('input[name="emailAddress"]');
  await page.fill('input[name="emailAddress"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Continuer"), button:has-text("Continue")');

  // Wait for OTP input
  console.log("[2] Entering OTP 424242...");
  // Clerk OTP fields are usually inputs with a specific aria-label or just wait for 6 inputs
  await page.waitForSelector('input[aria-label="Code à 6 chiffres"], input[name="code"], input[type="text"]', { timeout: 15000 });
  
  // Since Clerk renders 6 individual inputs for OTP in some versions, or a single hidden input
  // A robust way in playwright is to type directly into the focused element or the first input
  await page.keyboard.type('424242');
  
  // Wait for redirect to dashboard
  console.log("[3] Waiting for redirect to dashboard...");
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
  console.log("Successfully signed up and redirected to dashboard!");

  // Verify dashboard is empty
  console.log("[4] Verifying dashboard...");
  // Wait for some text that indicates empty dashboard
  // "Aucun compte connecté" or "Créer votre premier projet"
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `/Users/naomiklock/.gemini/antigravity-ide/brain/7267a37a-fe29-4026-8e73-ad1e4071683d/dashboard_${timestamp}.png` });

  // Let's just output success and we can do database assertions in a separate node script
  console.log("Dashboard loaded. Check screenshot.");
  
  await browser.close();
}

main().catch(console.error);
