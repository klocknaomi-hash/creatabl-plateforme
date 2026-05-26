const { chromium } = require('playwright');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const WEBSITE_PUBLIC_DIR = '/Users/naomiklock/Desktop/next.js/creatabl-site(1)/site_web/public';
const DEV_LOG_FILE = '/Users/naomiklock/Desktop/next.js/creatabl-app/creatabl-ia/scratch/next-dev.log';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to check if the port is open
function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.request({ 
      host: '127.0.0.1', 
      port, 
      path: '/',
      timeout: 1500 
    }, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function run() {
  console.log("Checking if local Next.js server is running on port 3000...");
  let isServerRunning = await checkPort(3000);
  let devServerProcess = null;

  if (!isServerRunning) {
    console.log("Server not running. Starting next dev in background...");
    
    // Create or clear the next-dev.log file
    fs.writeFileSync(DEV_LOG_FILE, '');
    const logStream = fs.createWriteStream(DEV_LOG_FILE, { flags: 'a' });

    devServerProcess = spawn('npm', ['run', 'dev'], {
      cwd: '/Users/naomiklock/Desktop/next.js/creatabl-app/creatabl-ia',
      shell: true,
      detached: true
    });

    devServerProcess.stdout.pipe(logStream);
    devServerProcess.stderr.pipe(logStream);
    
    if (devServerProcess.unref) {
      devServerProcess.unref();
    }

    // Wait for port 3000 to be open
    console.log("Waiting for server to start on port 3000...");
    for (let i = 0; i < 20; i++) {
      await wait(3000);
      isServerRunning = await checkPort(3000);
      if (isServerRunning) {
        console.log("Server is up and running!");
        break;
      }
      console.log(`Still waiting... (attempt ${i + 1}/20)`);
    }
  } else {
    console.log("Next.js server is already running on port 3000.");
  }

  if (!isServerRunning) {
    console.error("Failed to start or connect to Next.js dev server.");
    if (fs.existsSync(DEV_LOG_FILE)) {
      console.error("=== NEXT DEV LOGS ===");
      console.error(fs.readFileSync(DEV_LOG_FILE, 'utf8'));
    }
    process.exit(1);
  }

  console.log("Launching Chromium...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  try {
    console.log("Navigating to sign-in page...");
    await page.goto('http://127.0.0.1:3000/sign-in', { waitUntil: 'networkidle', timeout: 30000 });

    console.log("Checking for Clerk sign-in form...");
    try {
      await page.waitForSelector('input[name="identifier"]', { timeout: 8000 });
      console.log("Filling in sign-in credentials...");
      await page.fill('input[name="identifier"]', 'business-test@creatabl-ia.com');
      
      const continueBtn = page.locator('button.cl-formButtonPrimary, button[data-localization-key="formButtonPrimary"]');
      await continueBtn.click();
      
      console.log("Waiting for password input...");
      await page.waitForSelector('input[name="password"]', { timeout: 8000 });
      await page.fill('input[name="password"]', 'TestCreatabl2026!');
      
      const submitBtn = page.locator('button.cl-formButtonPrimary, button[data-localization-key="formButtonPrimary"]');
      await submitBtn.click();
      console.log("Credentials submitted.");
    } catch (err) {
      console.log("Sign-in form not found or already logged in. Proceeding...");
    }

    console.log("Waiting for redirection to dashboard...");
    await page.waitForURL('**/dashboard', { timeout: 25500 });
    console.log("Successfully logged in and reached Dashboard!");

    console.log("Waiting 8 seconds for animations and charts to render fully...");
    await wait(8000);

    // Ensure the output folder exists
    if (!fs.existsSync(WEBSITE_PUBLIC_DIR)) {
      console.log(`Creating directory: ${WEBSITE_PUBLIC_DIR}`);
      fs.mkdirSync(WEBSITE_PUBLIC_DIR, { recursive: true });
    }

    // 1. Dashboard screenshot
    const dashboardPath = path.join(WEBSITE_PUBLIC_DIR, 'dashboard.png');
    console.log(`Taking dashboard screenshot: ${dashboardPath}...`);
    await page.screenshot({ path: dashboardPath });
    console.log("Dashboard screenshot saved.");

    // 2. Analytics screenshot
    console.log("Navigating to Analytics page...");
    await page.goto('http://127.0.0.1:3000/dashboard/analytics', { waitUntil: 'networkidle' });
    console.log("Waiting 6 seconds for charts to render...");
    await wait(6000);
    const analyticsPath = path.join(WEBSITE_PUBLIC_DIR, 'analytics.png');
    console.log(`Taking analytics screenshot: ${analyticsPath}...`);
    await page.screenshot({ path: analyticsPath });
    console.log("Analytics screenshot saved.");

    // 3. Calendar screenshot
    console.log("Navigating to Calendar page...");
    await page.goto('http://127.0.0.1:3000/dashboard/calendar', { waitUntil: 'networkidle' });
    console.log("Waiting 5 seconds for calendar...");
    await wait(5000);
    const calendarPath = path.join(WEBSITE_PUBLIC_DIR, 'calendar.png');
    console.log(`Taking calendar screenshot: ${calendarPath}...`);
    await page.screenshot({ path: calendarPath });
    console.log("Calendar screenshot saved.");

    console.log("Screenshots captured successfully!");
  } catch (err) {
    console.error("Error during screenshot capture:", err);
    await page.screenshot({ path: 'scratch/error-capture.png' }).catch(() => {});
  } finally {
    await browser.close();
    console.log("Finished screenshots routine.");
    process.exit(0);
  }
}

run();
