// LHCI resolves Chrome differently once `puppeteerScript` is set: it
// tries `require('puppeteer').executablePath()` first, which throws when
// only `puppeteer-core` is installed (no bundled browser), short-circuiting
// the normal chrome-launcher auto-detection that the public-pages config
// relies on. Resolve the path ourselves the same way chrome-launcher does,
// so this config doesn't depend on `puppeteer` (vs. `puppeteer-core`)
// being installed.
const { Launcher } = require('chrome-launcher');
const chromePath = Launcher.getInstallations()[0];

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/en',
        'http://localhost:3000/en/leaves',
        'http://localhost:3000/en/users/settings',
      ],
      startServerCommand: 'yarn start',
      startServerReadyPattern: 'Ready in',
      chromePath,
      // One run per URL: each run signs up a brand-new account via
      // lighthouse-auth-script.js, so repeating runs for a median score
      // would mean repeating sign-up several times over for little
      // benefit. Revisit if these audits turn out to be noisy.
      numberOfRuns: 1,
      puppeteerScript: './lighthouse-auth-script.js',
      // chromeFlags is ignored once puppeteerScript launches its own
      // browser -- LHCI warns to use puppeteerLaunchOptions.args instead.
      puppeteerLaunchOptions: {
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
  },
};
