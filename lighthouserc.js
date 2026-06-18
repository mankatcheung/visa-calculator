module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/en/sign-in',
        'http://localhost:3000/en/sign-up',
      ],
      startServerCommand: 'yarn start',
      startServerReadyPattern: 'Ready in',
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      // Not ".lighthouseci": actions/upload-artifact excludes dotfiles by
      // default, which would silently drop these from the CI artifact.
      outputDir: './lighthouse-reports',
    },
  },
};
