// Puppeteer setup script for LHCI: signs up a fresh, unique user before
// each authenticated-page audit, since the app's session cookie is the
// only way in (no header-based auth). LHCI hands us the shared `Browser`
// (not a `Page`) and reuses its cookies for the page it then audits.
module.exports = async (browser) => {
  require('dotenv').config({ path: '.env.local' });

  const email = `lhci-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
  const password = 'lighthouse-ci-password';

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/en/sign-up', {
    waitUntil: 'networkidle0',
  });
  await page.waitForSelector('[data-cy=email]');
  await page.type('[data-cy=email]', email);
  await page.type('[data-cy=password]', password);
  await page.type('[data-cy=confirmPassword]', password);
  await page.click('[data-cy=submit]');

  // After sign-up, user is redirected to /verify-email (email not yet confirmed)
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });

  // Mark user as verified directly in the DB — email delivery is not possible
  // in CI, so we bypass it here the same way the Cypress verifyUser task does.
  const { createClient } = require('@libsql/client');
  const url = process.env.DATABASE_URL ?? 'file:sqlite.db';
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient({ url, authToken });
  try {
    await client.execute({
      sql: 'UPDATE users SET email_verified = 1 WHERE email = ?',
      args: [email],
    });
  } finally {
    client.close();
  }

  // Navigate to the dashboard now that the session user is verified
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-cy=dashboard-content]', {
    timeout: 30000,
  });
  await page.close();
};
