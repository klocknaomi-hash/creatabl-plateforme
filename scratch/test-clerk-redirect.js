const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { chromium } = require('playwright');

async function main() {
  const { clerkClient } = await import('@clerk/nextjs/server');
  const client = await clerkClient();

  const email = 'business-test@creatabl-ia.com';
  try {
    const existing = await client.users.getUserList({ emailAddress: [email] });
    const user = existing.data[0];
    const userId = user.id;

    console.log("Creating SignInToken...");
    const tokenObj = await client.signInTokens.createSignInToken({
      userId: userId,
      expiresInSeconds: 300
    });

    // Append redirect_url
    const loginUrl = `${tokenObj.url}&redirect_url=http://localhost:3000/dashboard`;
    console.log(`Navigating to: ${loginUrl}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    await page.goto(loginUrl, { waitUntil: 'load', timeout: 60000 });
    console.log("Page loaded. Waiting 8s for redirection...");
    await page.waitForTimeout(8000);

    console.log("Final URL:", page.url());
    await page.screenshot({ path: 'scratch/redirect-result.png' });

    await browser.close();

  } catch (err) {
    console.error("Error:", err);
  }
}

main();
