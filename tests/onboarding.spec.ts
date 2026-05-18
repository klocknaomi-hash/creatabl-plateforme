import { test, expect } from '@playwright/test';

test.describe('Creatabl Onboarding Flow', () => {
  const email = `test_${Date.now()}@yopmail.com`;
  const password = 'TestCreatabl123!';

  test('should complete the full onboarding flow', async ({ page, context }) => {
    test.setTimeout(120000);
    console.log(`Starting test with email: ${email}`);

    // 1. Go to landing page
    await page.goto('https://creatabl-ia.com');
    console.log('Navigated to landing page');

    // 2. Click the first plan CTA button
    const cta = page.locator('text=Essai 7 jours').first();
    await cta.click();
    console.log('Clicked CTA button');

    // Handle redirection to pricing/tarifs
    await page.waitForURL(url => url.toString().includes('tarifs') || url.toString().includes('sign-up'), { timeout: 10000 });
    console.log(`Current URL after CTA: ${page.url()}`);

    if (page.url().includes('tarifs')) {
      await page.locator('text=Essayer Starter').first().click();
      console.log('Clicked Essayer Starter on tarifs page');
    }

    // 3. Fill in sign-up form
    try {
      await page.waitForURL(url => url.toString().includes('sign-up'), { timeout: 15000 });
      console.log('On sign-up page');
      await page.waitForSelector('.cl-card', { state: 'visible', timeout: 15000 });
      
      const emailInput = page.locator('input[name="emailAddress"]');
      const passwordInput = page.locator('input[name="password"]');
      const submitButton = page.locator('button.cl-formButtonPrimary');

      await emailInput.fill(email);
      await passwordInput.fill(password);
      await page.waitForTimeout(500);

      // Handle Turnstile if it exists
      const turnstile = page.locator('iframe[src*="challenges.cloudflare.com"]');
      if (await turnstile.count() > 0) {
        console.log('Cloudflare Turnstile detected. Attempting to click center of iframe...');
        const frame = page.frameLocator('iframe[src*="challenges.cloudflare.com"]');
        // Click the checkbox or the area around it
        await frame.locator('#challenge-stage, .ctp-checkbox-container').click().catch(() => {});
        await page.waitForTimeout(5000); // Wait for challenge to solve
      }

      await submitButton.click();
      console.log('Submitted sign-up form');
    } catch (e: any) {
      await page.screenshot({ path: 'tests/error-sign-up.png' });
      console.log(`Sign-up failed. Screenshot saved. Error: ${e.message}`);
      throw e;
    }

    // 4. Complete Clerk email verification
    try {
      await page.waitForSelector('input[name="code"]', { timeout: 15000 });
      console.log('Verification code field found. Checking Yopmail...');

      const yopPage = await context.newPage();
      // Yopmail login
      await yopPage.goto(`https://yopmail.com/fr/?login=${email.split('@')[0]}`);
      
      let code = '';
      for (let i = 0; i < 20; i++) {
        await yopPage.click('#refresh');
        await yopPage.waitForTimeout(3000);
        const iframe = yopPage.frameLocator('#ifmail');
        const text = await iframe.locator('body').innerText();
        const match = text.match(/\d{6}/);
        if (match) {
          code = match[0];
          break;
        }
        console.log(`Polling Yopmail... attempt ${i+1}`);
      }

      if (!code) throw new Error('Verification code not found in Yopmail');
      console.log(`Found code: ${code}`);
      await yopPage.close();

      await page.fill('input[name="code"]', code);
      console.log('Entered verification code');
    } catch (e: any) {
      console.log('Verification step failed or skipped: ' + e.message);
      if (e.message.includes('timeout')) {
         await page.screenshot({ path: 'tests/error-verification.png' });
      }
    }

    // 5. Stripe Checkout
    try {
      console.log('Waiting for Stripe Checkout...');
      await page.waitForURL(/.*checkout.stripe.com.*/, { timeout: 40000 });
      console.log('On Stripe Checkout page');

      // Stripe fields are often in iframes if it's Elements, but Checkout is a direct page.
      // However, the fields might be slow.
      await page.waitForSelector('#email', { timeout: 15000 });
      await page.fill('#email', email);
      await page.fill('#cardNumber', '4242424242424242');
      await page.fill('#cardExpiry', '1229');
      await page.fill('#cardCvc', '424');
      await page.fill('#billingName', 'Test User');
      
      await page.click('button[type="submit"]');
      console.log('Submitted Stripe payment');
    } catch (e: any) {
      await page.screenshot({ path: 'tests/error-stripe.png' });
      console.log(`Stripe failed. Screenshot saved. Error: ${e.message}`);
      throw e;
    }

    // 6. Redirect to dashboard
    await page.waitForURL(/.*app.creatabl-ia.com\/dashboard.*/, { timeout: 60000 });
    console.log('Redirected to Dashboard');

    // 7. Onboarding Modal
    try {
      console.log('Starting Onboarding Modal steps...');

      // Step 0: Click "Suivant"
      await page.getByRole('button', { name: 'Suivant' }).click({ timeout: 15000 });
      console.log('Step 0 completed');

      // Step 1: Select "Individuel"
      await page.getByText('Créateur / Individuel').click();
      await page.getByRole('button', { name: 'Suivant' }).click();
      console.log('Step 1 completed');

      // Step 2: Click "Le faire plus tard"
      await page.getByText('Le faire plus tard').click();
      console.log('Step 2 completed');

      // Step 3: Type "Studio Test"
      await page.getByPlaceholder('Ex : Mon agence, Studio Léa, Marque perso...').fill('Studio Test');
      await page.getByRole('button', { name: 'Suivant' }).click();
      console.log('Step 3 completed');

      // Step 4: Select "Professionnel"
      await page.getByText('Professionnel').click();
      await page.getByRole('button', { name: 'Suivant' }).click();
      console.log('Step 4 completed');

      // Step 5: Select "Pas de préférence"
      await page.getByText('Pas de préférence').click();
      await page.getByRole('button', { name: 'Suivant' }).click();
      console.log('Step 5 completed');

      // Step 6: Select "Modéré (1 à 4)"
      await page.getByText('Modéré (1 à 4)').click();
      await page.getByRole('button', { name: 'Suivant' }).click();
      console.log('Step 6 completed');

      // Final screen: Click "Valider"
      await page.getByRole('button', { name: 'Valider' }).click();
      console.log('Final step completed');
    } catch (e: any) {
      await page.screenshot({ path: 'tests/error-onboarding.png' });
      console.log(`Onboarding failed. Screenshot saved. Error: ${e.message}`);
      throw e;
    }

    // 8. Final Verification
    await expect(page.locator('text=Premiers pas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Ton essai gratuit termine dans 7 jours')).toBeVisible({ timeout: 15000 });
    console.log('Final verification passed!');
  });
});
