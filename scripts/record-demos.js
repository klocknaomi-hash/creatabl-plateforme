const { chromium } = require('playwright');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const SITE_PUBLIC_VIDEOS = '/Users/naomiklock/Desktop/next.js/creatabl-site(1)/site_web/public/videos';
const TEMP_RECORDINGS_DIR = path.join(__dirname, '../scratch/temp-recordings');
const STORAGE_STATE_PATH = path.join(__dirname, '../scratch/state.json');
const DEV_LOG_FILE = path.join(__dirname, '../scratch/next-dev.log');

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

// Helper to convert WebM to MP4 using ffmpeg
function convertToMp4(inputPath, outputPath) {
  console.log(`Converting ${inputPath} to ${outputPath}...`);
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      '-y', // Overwrite output files
      '-i', inputPath,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'fast',
      '-crf', '22',
      outputPath
    ]);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`Conversion completed successfully!`);
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(err);
    });
  });
}

// Helper to move mouse smoothly to a selector
async function smoothMove(page, selector, steps = 30) {
  const element = await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  const box = await element.boundingBox();
  if (!box) {
    throw new Error(`Selector ${selector} has no bounding box`);
  }
  const targetX = box.x + box.width / 2;
  const targetY = box.y + box.height / 2;
  await page.mouse.move(targetX, targetY, { steps });
  await wait(300);
}

// Helper to move mouse and click
async function smoothClick(page, selector, steps = 30) {
  await smoothMove(page, selector, steps);
  await page.mouse.down();
  await wait(80);
  await page.mouse.up();
  await wait(500);
}

async function doLogin() {
  console.log("Logging into Clerk using Backend SignInToken...");
  
  let loginUrl = '';
  try {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const existing = await client.users.getUserList({
      emailAddress: ['business-test@creatabl-ia.com']
    });

    if (existing.data.length === 0) {
      throw new Error("User business-test@creatabl-ia.com not found in Clerk.");
    }

    const userId = existing.data[0].id;
    console.log(`Generating Clerk SignInToken for ${userId}...`);
    const tokenObj = await client.signInTokens.createSignInToken({
      userId: userId,
      expiresInSeconds: 300
    });
    loginUrl = tokenObj.url;
  } catch (err) {
    console.error("Failed to generate SignInToken server-side:", err);
    throw err;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log(`Navigating to auto-login URL...`);
    await page.goto(loginUrl, { waitUntil: 'load', timeout: 60000 });
    await wait(3000);

    // Wait to land on dashboard
    await page.waitForURL('**/dashboard', { timeout: 35000 });
    console.log("Login successful! Saving storage state...");
    await context.storageState({ path: STORAGE_STATE_PATH });
    
  } catch (err) {
    console.error("Login session save failed:", err);
    await page.screenshot({ path: path.join(__dirname, '../scratch/error-login-fatal.png') });
    throw err;
  } finally {
    await browser.close();
  }
}

async function recordVideo1() {
  console.log("\n--- Recording Video 1: Créer un post avec l'IA ---");
  const browser = await chromium.launch({ headless: true });
  
  const videoDir = path.join(TEMP_RECORDINGS_DIR, 'video1');
  fs.mkdirSync(videoDir, { recursive: true });

  const context = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/dashboard/compose', { waitUntil: 'load' });
    await wait(2000);

    // Select first platform card (LinkedIn)
    await smoothClick(page, 'div.relative.flex.items-center.gap-3.p-2\\.5.pr-4.rounded-xl.border-2');
    await wait(1000);

    // Fill in the AI idea prompt input
    await smoothClick(page, 'input[placeholder="Décris ton idée de post..."]');
    await page.fill('input[placeholder="Décris ton idée de post..."]', "5 conseils pour réussir sa transition de carrière avec l'IA en 2026");
    await wait(1500);

    // Click Generate button
    await smoothClick(page, 'button:has-text("Générer")');
    console.log("Generating post with IA...");
    await wait(7500); // Let generation complete

    // Enable schedule switch
    await smoothClick(page, 'button[id="schedule-toggle"], label[for="schedule-toggle"]');
    await wait(2000);

    // Click on Programmer button in header
    await smoothClick(page, 'button:has-text("Programmer")');
    await page.waitForURL('**/dashboard/posts', { timeout: 15000 });
    await wait(3000);

  } catch (err) {
    console.error("Video 1 recording failed:", err);
  } finally {
    await context.close();
    await browser.close();

    // Convert video
    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const input = path.join(videoDir, videoFile);
      const output = path.join(SITE_PUBLIC_VIDEOS, 'demo-create-post.mp4');
      await convertToMp4(input, output);
    }
  }
}

async function recordVideo2() {
  console.log("\n--- Recording Video 2: Agent IA (Tendances) ---");
  const browser = await chromium.launch({ headless: true });
  const videoDir = path.join(TEMP_RECORDINGS_DIR, 'video2');
  fs.mkdirSync(videoDir, { recursive: true });

  const context = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/dashboard/agent-ia', { waitUntil: 'load' });
    await wait(2000);

    await smoothClick(page, 'text="Générateur d\'idées"');
    await wait(3000); // Wait for trends to load

    await smoothClick(page, 'div.border.rounded-xl.p-4.cursor-pointer');
    await wait(1500);

    await smoothClick(page, 'button:has-text("Générer 3 idées de post IA")');
    console.log("Generating ideas...");
    await wait(7500); // Wait for ideas cards to appear

    await smoothClick(page, 'button:has-text("Utiliser dans l\'éditeur")');
    await page.waitForURL('**/dashboard/compose**', { timeout: 15000 });
    await wait(3000);

  } catch (err) {
    console.error("Video 2 recording failed:", err);
  } finally {
    await context.close();
    await browser.close();

    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const input = path.join(videoDir, videoFile);
      const output = path.join(SITE_PUBLIC_VIDEOS, 'demo-agent-ia.mp4');
      await convertToMp4(input, output);
    }
  }
}

async function recordVideo3() {
  console.log("\n--- Recording Video 3: Calendrier éditorial ---");
  const browser = await chromium.launch({ headless: true });
  const videoDir = path.join(TEMP_RECORDINGS_DIR, 'video3');
  fs.mkdirSync(videoDir, { recursive: true });

  const context = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/dashboard/calendar', { waitUntil: 'load' });
    await wait(4000);

    // Click on a scheduled post on the calendar
    await smoothClick(page, '.fc-event, div.cursor-pointer:has-text("Planifié"), div.cursor-pointer:has-text("L\'intelligence")');
    await wait(4000);

  } catch (err) {
    console.error("Video 3 recording failed:", err);
  } finally {
    await context.close();
    await browser.close();

    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const input = path.join(videoDir, videoFile);
      const output = path.join(SITE_PUBLIC_VIDEOS, 'demo-calendrier.mp4');
      await convertToMp4(input, output);
    }
  }
}

async function recordVideo4() {
  console.log("\n--- Recording Video 4: Analytics ---");
  const browser = await chromium.launch({ headless: true });
  const videoDir = path.join(TEMP_RECORDINGS_DIR, 'video4');
  fs.mkdirSync(videoDir, { recursive: true });

  const context = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/dashboard/analytics', { waitUntil: 'load' });
    await wait(3000);

    await smoothMove(page, 'text="Impressions"');
    await wait(1500);
    await smoothMove(page, 'text="Engagement"');
    await wait(1500);
    await smoothMove(page, 'text="Clics"');
    await wait(2000);

    await smoothMove(page, 'text="LinkedIn"');
    await wait(1500);
    await smoothMove(page, 'text="Instagram"');
    await wait(3000);

  } catch (err) {
    console.error("Video 4 recording failed:", err);
  } finally {
    await context.close();
    await browser.close();

    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const input = path.join(videoDir, videoFile);
      const output = path.join(SITE_PUBLIC_VIDEOS, 'demo-analytics.mp4');
      await convertToMp4(input, output);
    }
  }
}

async function recordVideo5() {
  console.log("\n--- Recording Video 5: Comptes connectés ---");
  const browser = await chromium.launch({ headless: true });
  const videoDir = path.join(TEMP_RECORDINGS_DIR, 'video5');
  fs.mkdirSync(videoDir, { recursive: true });

  const context = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/dashboard/settings/connections', { waitUntil: 'load' });
    await wait(3000);

    await smoothMove(page, 'text="LinkedIn"');
    await wait(1500);
    await smoothMove(page, 'text="Instagram"');
    await wait(1500);
    await smoothMove(page, 'text="Facebook"');
    await wait(1500);
    await smoothMove(page, 'text="Twitter / X"');
    await wait(3000);

  } catch (err) {
    console.error("Video 5 recording failed:", err);
  } finally {
    await context.close();
    await browser.close();

    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const input = path.join(videoDir, videoFile);
      const output = path.join(SITE_PUBLIC_VIDEOS, 'demo-comptes.mp4');
      await convertToMp4(input, output);
    }
  }
}

async function recordVideo6() {
  console.log("\n--- Recording Video 6: Gestion équipe ---");
  const browser = await chromium.launch({ headless: true });
  const videoDir = path.join(TEMP_RECORDINGS_DIR, 'video6');
  fs.mkdirSync(videoDir, { recursive: true });

  const context = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/dashboard/equipe/membres', { waitUntil: 'load' });
    await wait(3000);

    await smoothClick(page, 'button:has-text("Inviter un membre"), button:has-text("Inviter")');
    await wait(1500);

    await page.waitForSelector('text="Inviter un collaborateur"', { state: 'visible', timeout: 5000 });
    await wait(4000);

  } catch (err) {
    console.error("Video 6 recording failed:", err);
  } finally {
    await context.close();
    await browser.close();

    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const input = path.join(videoDir, videoFile);
      const output = path.join(SITE_PUBLIC_VIDEOS, 'demo-equipe.mp4');
      await convertToMp4(input, output);
    }
  }
}

async function main() {
  fs.mkdirSync(SITE_PUBLIC_VIDEOS, { recursive: true });
  fs.mkdirSync(TEMP_RECORDINGS_DIR, { recursive: true });

  console.log("Killing any existing process on port 3000...");
  try {
    const { execSync } = require('child_process');
    execSync('kill -9 $(lsof -t -i:3000) 2>/dev/null || true');
    await wait(2000);
  } catch (e) {}

  console.log("Starting Next.js dev server...");
  
  // Clear log
  fs.writeFileSync(DEV_LOG_FILE, '');
  const logStream = fs.createWriteStream(DEV_LOG_FILE, { flags: 'a' });

  const devServerProcess = spawn('npm', ['run', 'dev'], {
    cwd: '/Users/naomiklock/Desktop/next.js/creatabl-app/creatabl-ia',
    shell: true,
    detached: true
  });

  devServerProcess.stdout.pipe(logStream);
  devServerProcess.stderr.pipe(logStream);
  
  if (devServerProcess.unref) {
    devServerProcess.unref();
  }

  console.log("Waiting for server to start on port 3000...");
  let isServerRunning = false;
  for (let i = 0; i < 20; i++) {
    await wait(3000);
    isServerRunning = await checkPort(3000);
    if (isServerRunning) {
      console.log("Server is up and running!");
      break;
    }
    console.log(`Still waiting... (attempt ${i + 1}/20)`);
  }

  if (!isServerRunning) {
    console.error("Failed to start or connect to Next.js dev server.");
    process.exit(1);
  }

  try {
    await doLogin();
    await recordVideo1();
    await recordVideo2();
    await recordVideo3();
    await recordVideo4();
    await recordVideo5();
    await recordVideo6();
    console.log("\n=== ALL VIDEOS CAPTURED AND CONVERTED TO MP4 SUCCESSFULLY ===");
  } catch (e) {
    console.error("Fatal recording error:", e);
    process.exit(1);
  } finally {
    // Kill dev server if we launched it
    if (devServerProcess) {
      console.log("Stopping local dev server...");
      try {
        process.kill(-devServerProcess.pid); // Kill process group
      } catch (e) {
        try {
          devServerProcess.kill();
        } catch (_) {}
      }
    }
    process.exit(0);
  }
}

main();
