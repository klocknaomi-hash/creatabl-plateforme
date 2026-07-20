const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
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
    await page.waitForTimeout(5000);
    
    console.log("URL:", page.url());
    
    // Find the OTP input
    const otpInput = await page.waitForSelector('input[data-input-otp="true"], input[autocomplete="one-time-code"]', { timeout: 10000 });
    if (otpInput) {
      console.log("OTP Input found. Taking screenshot before typing...");
      await page.screenshot({ path: path.join(__dirname, 'otp-before.png') });
      
      // Focus, click, and click again to make sure it's active
      await otpInput.focus();
      await otpInput.click();
      await page.waitForTimeout(500);
      
      // Type 424242
      console.log("Typing 424242...");
      await page.keyboard.type('424242', { delay: 150 });
      await page.waitForTimeout(2000);
      
      // Take screenshot after typing
      await page.screenshot({ path: path.join(__dirname, 'otp-after-type.png') });
      
      // Dump value
      const val = await page.evaluate(el => el.value, otpInput);
      console.log("Input value:", val);
      
      // If still on sign-in, try clicking submit button
      if (page.url().includes('sign-in')) {
        console.log("Still on sign-in page. Trying to click Continue...");
        const submitBtn = await page.$('button[data-localization-key="formButtonPrimary"], button.cl-formButtonPrimary');
        if (submitBtn) {
          await submitBtn.click();
          await page.waitForTimeout(5000);
          await page.screenshot({ path: path.join(__dirname, 'otp-after-click.png') });
          console.log("URL after clicking continue:", page.url());
        }
      }
    } else {
      console.log("OTP Input not found");
    }

  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    await browser.close();
  }
}

main();
