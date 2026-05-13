# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/onboarding.spec.ts >> Creatabl Onboarding Flow >> should complete the full onboarding flow
- Location: tests/onboarding.spec.ts:7:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 40000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]:
        - heading "Créez votre compte" [level=1] [ref=e8]
        - paragraph [ref=e9]: pour continuer vers Creatabl-ia
      - generic [ref=e10]:
        - generic [ref=e12]:
          - button "Sign in with Facebook Facebook" [disabled]:
            - generic:
              - generic:
                - generic "Sign in with Facebook"
              - generic: Facebook
          - button "Sign in with Google Google" [disabled]:
            - generic:
              - generic:
                - generic "Sign in with Google"
              - generic: Google
        - paragraph [ref=e15]: ou
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e21]:
              - generic [ref=e22]:
                - generic: Adresse e-mail
              - textbox "Adresse e-mail" [disabled]: test_1778614082025@yopmail.com
            - generic [ref=e25]:
              - generic [ref=e26]:
                - generic [ref=e27]:
                  - generic: Mot de passe
                - generic [ref=e28]:
                  - textbox "Mot de passe" [disabled]:
                    - /placeholder: Create a password
                    - text: TestCreatabl123!
                  - button "Show password" [ref=e29] [cursor=pointer]:
                    - img [ref=e30]
              - generic [ref=e33]: Bien joué. C'est un excellent mot de passe.
              - paragraph [ref=e35]:
                - img [ref=e36]
                - text: Bien joué. C'est un excellent mot de passe.
          - generic [ref=e41]:
            - button "Loading" [disabled]:
              - generic:
                - generic "Loading"
    - generic [ref=e42]:
      - generic [ref=e43]:
        - generic [ref=e44]: Vous avez déjà un compte ?
        - link "Se connecter" [ref=e45] [cursor=pointer]:
          - /url: https://app.creatabl-ia.com/sign-in#/?plan=starter
      - generic [ref=e47]:
        - generic [ref=e49]:
          - paragraph [ref=e50]: Secured by
          - link "Clerk logo" [ref=e51] [cursor=pointer]:
            - /url: https://go.clerk.com/components
            - img [ref=e52]
        - paragraph [ref=e57]: Development mode
  - region "Notifications alt+T"
  - alert [ref=e58]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Creatabl Onboarding Flow', () => {
  4   |   const email = `test_${Date.now()}@yopmail.com`;
  5   |   const password = 'TestCreatabl123!';
  6   | 
  7   |   test('should complete the full onboarding flow', async ({ page, context }) => {
  8   |     test.setTimeout(120000);
  9   |     console.log(`Starting test with email: ${email}`);
  10  | 
  11  |     // 1. Go to landing page
  12  |     await page.goto('https://creatabl-ia.com');
  13  |     console.log('Navigated to landing page');
  14  | 
  15  |     // 2. Click the first plan CTA button
  16  |     const cta = page.locator('text=Essai 7 jours').first();
  17  |     await cta.click();
  18  |     console.log('Clicked CTA button');
  19  | 
  20  |     // Handle redirection to pricing/tarifs
  21  |     await page.waitForURL(url => url.toString().includes('tarifs') || url.toString().includes('sign-up'), { timeout: 10000 });
  22  |     console.log(`Current URL after CTA: ${page.url()}`);
  23  | 
  24  |     if (page.url().includes('tarifs')) {
  25  |       await page.locator('text=Essayer Starter').first().click();
  26  |       console.log('Clicked Essayer Starter on tarifs page');
  27  |     }
  28  | 
  29  |     // 3. Fill in sign-up form
  30  |     try {
  31  |       await page.waitForURL(url => url.toString().includes('sign-up'), { timeout: 15000 });
  32  |       console.log('On sign-up page');
  33  |       await page.waitForSelector('.cl-card', { state: 'visible', timeout: 15000 });
  34  |       
  35  |       const emailInput = page.locator('input[name="emailAddress"]');
  36  |       const passwordInput = page.locator('input[name="password"]');
  37  |       const submitButton = page.locator('button.cl-formButtonPrimary');
  38  | 
  39  |       await emailInput.fill(email);
  40  |       await passwordInput.fill(password);
  41  |       await page.waitForTimeout(500);
  42  | 
  43  |       // Handle Turnstile if it exists
  44  |       const turnstile = page.locator('iframe[src*="challenges.cloudflare.com"]');
  45  |       if (await turnstile.count() > 0) {
  46  |         console.log('Cloudflare Turnstile detected. Attempting to click center of iframe...');
  47  |         const frame = page.frameLocator('iframe[src*="challenges.cloudflare.com"]');
  48  |         // Click the checkbox or the area around it
  49  |         await frame.locator('#challenge-stage, .ctp-checkbox-container').click().catch(() => {});
  50  |         await page.waitForTimeout(5000); // Wait for challenge to solve
  51  |       }
  52  | 
  53  |       await submitButton.click();
  54  |       console.log('Submitted sign-up form');
  55  |     } catch (e) {
  56  |       await page.screenshot({ path: 'tests/error-sign-up.png' });
  57  |       console.log(`Sign-up failed. Screenshot saved. Error: ${e.message}`);
  58  |       throw e;
  59  |     }
  60  | 
  61  |     // 4. Complete Clerk email verification
  62  |     try {
  63  |       await page.waitForSelector('input[name="code"]', { timeout: 15000 });
  64  |       console.log('Verification code field found. Checking Yopmail...');
  65  | 
  66  |       const yopPage = await context.newPage();
  67  |       // Yopmail login
  68  |       await yopPage.goto(`https://yopmail.com/fr/?login=${email.split('@')[0]}`);
  69  |       
  70  |       let code = '';
  71  |       for (let i = 0; i < 20; i++) {
  72  |         await yopPage.click('#refresh');
  73  |         await yopPage.waitForTimeout(3000);
  74  |         const iframe = yopPage.frameLocator('#ifmail');
  75  |         const text = await iframe.locator('body').innerText();
  76  |         const match = text.match(/\d{6}/);
  77  |         if (match) {
  78  |           code = match[0];
  79  |           break;
  80  |         }
  81  |         console.log(`Polling Yopmail... attempt ${i+1}`);
  82  |       }
  83  | 
  84  |       if (!code) throw new Error('Verification code not found in Yopmail');
  85  |       console.log(`Found code: ${code}`);
  86  |       await yopPage.close();
  87  | 
  88  |       await page.fill('input[name="code"]', code);
  89  |       console.log('Entered verification code');
  90  |     } catch (e) {
  91  |       console.log('Verification step failed or skipped: ' + e.message);
  92  |       if (e.message.includes('timeout')) {
  93  |          await page.screenshot({ path: 'tests/error-verification.png' });
  94  |       }
  95  |     }
  96  | 
  97  |     // 5. Stripe Checkout
  98  |     try {
  99  |       console.log('Waiting for Stripe Checkout...');
> 100 |       await page.waitForURL(/.*checkout.stripe.com.*/, { timeout: 40000 });
      |                  ^ TimeoutError: page.waitForURL: Timeout 40000ms exceeded.
  101 |       console.log('On Stripe Checkout page');
  102 | 
  103 |       // Stripe fields are often in iframes if it's Elements, but Checkout is a direct page.
  104 |       // However, the fields might be slow.
  105 |       await page.waitForSelector('#email', { timeout: 15000 });
  106 |       await page.fill('#email', email);
  107 |       await page.fill('#cardNumber', '4242424242424242');
  108 |       await page.fill('#cardExpiry', '1229');
  109 |       await page.fill('#cardCvc', '424');
  110 |       await page.fill('#billingName', 'Test User');
  111 |       
  112 |       await page.click('button[type="submit"]');
  113 |       console.log('Submitted Stripe payment');
  114 |     } catch (e) {
  115 |       await page.screenshot({ path: 'tests/error-stripe.png' });
  116 |       console.log(`Stripe failed. Screenshot saved. Error: ${e.message}`);
  117 |       throw e;
  118 |     }
  119 | 
  120 |     // 6. Redirect to dashboard
  121 |     await page.waitForURL(/.*app.creatabl-ia.com\/dashboard.*/, { timeout: 60000 });
  122 |     console.log('Redirected to Dashboard');
  123 | 
  124 |     // 7. Onboarding Modal
  125 |     try {
  126 |       console.log('Starting Onboarding Modal steps...');
  127 | 
  128 |       // Step 0: Click "Suivant"
  129 |       await page.getByRole('button', { name: 'Suivant' }).click({ timeout: 15000 });
  130 |       console.log('Step 0 completed');
  131 | 
  132 |       // Step 1: Select "Individuel"
  133 |       await page.getByText('Créateur / Individuel').click();
  134 |       await page.getByRole('button', { name: 'Suivant' }).click();
  135 |       console.log('Step 1 completed');
  136 | 
  137 |       // Step 2: Click "Le faire plus tard"
  138 |       await page.getByText('Le faire plus tard').click();
  139 |       console.log('Step 2 completed');
  140 | 
  141 |       // Step 3: Type "Studio Test"
  142 |       await page.getByPlaceholder('Ex : Mon agence, Studio Léa, Marque perso...').fill('Studio Test');
  143 |       await page.getByRole('button', { name: 'Suivant' }).click();
  144 |       console.log('Step 3 completed');
  145 | 
  146 |       // Step 4: Select "Professionnel"
  147 |       await page.getByText('Professionnel').click();
  148 |       await page.getByRole('button', { name: 'Suivant' }).click();
  149 |       console.log('Step 4 completed');
  150 | 
  151 |       // Step 5: Select "Pas de préférence"
  152 |       await page.getByText('Pas de préférence').click();
  153 |       await page.getByRole('button', { name: 'Suivant' }).click();
  154 |       console.log('Step 5 completed');
  155 | 
  156 |       // Step 6: Select "Modéré (1 à 4)"
  157 |       await page.getByText('Modéré (1 à 4)').click();
  158 |       await page.getByRole('button', { name: 'Suivant' }).click();
  159 |       console.log('Step 6 completed');
  160 | 
  161 |       // Final screen: Click "Valider"
  162 |       await page.getByRole('button', { name: 'Valider' }).click();
  163 |       console.log('Final step completed');
  164 |     } catch (e) {
  165 |       await page.screenshot({ path: 'tests/error-onboarding.png' });
  166 |       console.log(`Onboarding failed. Screenshot saved. Error: ${e.message}`);
  167 |       throw e;
  168 |     }
  169 | 
  170 |     // 8. Final Verification
  171 |     await expect(page.locator('text=Premiers pas')).toBeVisible({ timeout: 15000 });
  172 |     await expect(page.locator('text=Ton essai gratuit termine dans 7 jours')).toBeVisible({ timeout: 15000 });
  173 |     console.log('Final verification passed!');
  174 |   });
  175 | });
  176 | 
```