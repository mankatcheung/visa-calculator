// Puppeteer setup script for LHCI: signs up a fresh, unique user before
// each authenticated-page audit, since the app's session cookie is the
// only way in (no header-based auth). LHCI hands us the shared `Browser`
// (not a `Page`) and reuses its cookies for the page it then audits.
module.exports = async (browser) => {
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

  await page.waitForSelector('[data-cy=dashboard-content]', {
    timeout: 30000,
  });
  await page.close();
};
