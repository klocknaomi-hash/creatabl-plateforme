const { chromium } = require('playwright');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Kill process on port 3000
  try {
    console.log("Killing process on port 3000...");
    execSync('kill -9 $(lsof -t -i:3000) 2>/dev/null || true');
    await wait(2000);
  } catch (e) {
    console.log("No process to kill or failed to kill:", e.message);
  }

  // Start server
  console.log("Starting Next.js dev server...");
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: '/Users/naomiklock/Desktop/next.js/creatabl-app/creatabl-ia',
    shell: true
  });

  let clerkCode = null;

  devServer.stdout.on('data', (data) => {
    const text = data.toString();
    console.log(`[Next.js stdout] ${text.trim()}`);
    // Check for Clerk code patterns
    // e.g. "Clerk", "verification code", "code:", 6-digit number
    const match = text.match(/(?:code|clerk|verification).*?(\d{6})/i);
    if (match) {
      clerkCode = match[1];
      console.log(`FOUND CLERK CODE IN STDOUT: ${clerkCode}`);
    }
  });

  devServer.stderr.on('data', (data) => {
    console.error(`[Next.js stderr] ${data.toString().trim()}`);
  });

  // Wait for port 3000 to be open
  console.log("Waiting for server to be ready on port 3000...");
  await wait(8000);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log("Going to sign-in page...");
    await page.goto('http://localhost:3000/sign-in', { waitUntil: 'networkidle', timeout: 60000 });
    
    await page.fill('input[name="identifier"]', 'business-test@creatabl-ia.com');
    await page.click('button[data-localization-key="formButtonPrimary"], button.cl-formButtonPrimary');
    
    await page.waitForSelector('input[name="password"]', { timeout: 15000 });
    await page.fill('input[name="password"]', 'TestCreatabl2026!');
    await page.click('button[data-localization-key="formButtonPrimary"], button.cl-formButtonPrimary');

    console.log("Waiting for factor-two page...");
    await page.waitForTimeout(6000);
    
    console.log("Current URL:", page.url());
    
    // Look at the stdout for code for another few seconds
    console.log("Waiting to see if Clerk code is printed to stdout...");
    for (let i = 0; i < 10; i++) {
      if (clerkCode) break;
      await wait(1000);
    }
    
    if (clerkCode) {
      console.log(`Using clerkCode: ${clerkCode}`);
      const otpInput = await page.waitForSelector('input[data-input-otp="true"], input[autocomplete="one-time-code"]', { timeout: 10000 });
      if (otpInput) {
        await otpInput.focus();
        await otpInput.click();
        await page.waitForTimeout(200);
        await page.keyboard.type(clerkCode, { delay: 100 });
        await page.waitForTimeout(5000);
        console.log("URL after entering found code:", page.url());
        await page.screenshot({ path: path.join(__dirname, 'otp-success.png') });
      }
    } else {
      console.log("No Clerk code was found in stdout.");
      await page.screenshot({ path: path.join(__dirname, 'otp-failure-stdout.png') });
    }

  } catch (err) {
    console.error("Error during execution:", err);
  } finally {
    console.log("Shutting down dev server...");
    devServer.kill('SIGINT');
    await browser.close();
  }
}

main();
