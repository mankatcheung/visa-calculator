# UK Visa Leave Tracker

A web application for recording and tracking the number of leaves (absences) for
UK visa compliance, built with Next.js, following clean architecture principles,
and equipped with robust tools for scalability, internationalization, testing,
and monitoring. It's also an installable Progressive Web App.

## Tech Stack

- **Next.js**: React framework for server-side rendering, static site
  generation, and API routes.
- **Drizzle ORM with Turso**: Lightweight TypeScript ORM for efficient database
  operations with Turso as the database.
- **Yarn**: Fast and reliable package manager for dependency management.
- **Clean Architecture**: Modular structure for maintainability and scalability.
- **Next-Intl**: Internationalization (i18n) for multi-language support.
- **PWA**: Installable on desktop and mobile, with an offline app-shell
  fallback (see [Progressive Web App](#progressive-web-app) below).
- **Cypress**: End-to-end testing framework for reliable UI testing.
- **cypress-axe**: Automated accessibility (a11y) auditing on key pages.
- **Vitest + React Testing Library**: Unit and component testing.
- **Lighthouse CI**: Automated performance/accessibility/best-practices/SEO
  budgets on every push.
- **Sentry**: Real-time error tracking and monitoring for bug detection.
- **Codecov**: Code coverage reporting to ensure test quality.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v22 or higher — matches the version CI runs)
- Yarn (v1.22 or higher)
- A Turso database instance (with connection details) — only needed to run
  the app against real persistent data (`yarn dev`/`yarn start`). Unit,
  component, and e2e tests all run against a local sqlite file and don't
  need one.
- A Sentry account (for error monitoring, optional)
- A Codecov account (for code coverage reporting, optional)
- A [Brevo](https://www.brevo.com) account (for transactional emails — password
  reset, email verification, and email-change OTP; optional but email flows
  will silently no-op without it)

## Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/mankatcheung/visa-calculator.git
   cd visa-calculator
   ```

2. **Install Dependencies**

   ```bash
   yarn install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the following:

   ```env
    SENTRY_DSN=your-sentry-dsn
    NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
    SENTRY_AUTH_TOKEN=your-sentry-auth-token
    DATABASE_URL=your-turso-database-url
    DATABASE_AUTH_TOKEN=your-turso-auth-token
    BREVO_API_KEY=your-brevo-api-key
    BREVO_SENDER_EMAIL=your-sender-email
    BREVO_SENDER_NAME=your-sender-name
   ```

   Replace `your-turso-database-url`, `your-turso-auth-token`,
   `your-sentry-dsn`, and `your-sentry-auth-token` with your respective
   credentials. The `BREVO_*` variables are required for transactional emails
   (password reset, email verification, and email-change OTP); obtain them
   from your [Brevo](https://www.brevo.com) account.

4. **Run the Development Server**

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see
   the application.

## Scripts

- `yarn dev`: Start the development server.
- `yarn build`: Build the application for production.
- `yarn start`: Start the production server.
- `yarn test`: Run unit and component tests with Vitest.
- `yarn coverage`: Run tests with coverage (uploaded to Codecov in CI).
- `yarn cy:run`: Run end-to-end tests with Cypress.
- `yarn cy:open`: Open the Cypress test runner interactively.
- `yarn lighthouse`: Run Lighthouse CI (`lhci autorun`) against a local build.
- `yarn lint`: Run ESLint for code linting.

## Database Setup

1. **Initialize Drizzle Migrations**

   Ensure your Turso database is set up and the `.env` file contains the correct
   credentials.

   ```bash
   yarn drizzle-kit generate
   yarn drizzle-kit migrate
   ```

2. **Run Migrations**

   Apply migrations to your Turso database:

   ```bash
   yarn drizzle-kit push
   ```

## Testing

### Unit & Component Tests (Vitest + React Testing Library)

Use-cases, controllers, and repositories are tested against a real local
sqlite database (`tests/units/{application,infrastructure,interface-adapters}`).
Components with real validation logic (e.g. `change-password-form`,
`leave-form`) are tested in isolation with React Testing Library
(`tests/units/components/`), mocking server actions, translations, and any
subcomponent (like date pickers) that isn't the focus of the test.

```bash
yarn test
```

### End-to-End Tests (Cypress)

E2E tests run against a local sqlite file, migrated fresh on every run — no
external database service required. The test file `sign-up.cy.ts` runs first
(see `cypress.config.ts`'s `specPattern`) so the account it creates exists for
the specs that follow.

Run e2e tests to simulate user interactions, such as recording a leave:

```bash
yarn cy:run
```

To open the Cypress test runner:

```bash
yarn cy:open
```

### Accessibility Tests (cypress-axe)

`cypress/e2e/accessibility.cy.ts` runs an axe-core scan against every
reachable page (sign-in, sign-up, dashboard, leaves, create-leave, user
settings) as part of the regular Cypress run. Violations fail the test and
are also printed to the terminal/CI log with their target selector and HTML,
not just the Cypress GUI.

### Performance Budgets (Lighthouse CI)

```bash
yarn lighthouse
```

Runs Lighthouse three times against the public sign-in/sign-up pages and
asserts minimum category scores (`lighthouserc.js`): performance ≥ 0.7,
accessibility/best-practices/SEO ≥ 0.9. Reports are written to
`lighthouse-reports/` (uploaded as a CI artifact on every push).

### Code Coverage (Codecov)

Generate a coverage report (uploaded to Codecov automatically in CI):

```bash
yarn coverage
```

View coverage reports on your Codecov dashboard.

## Progressive Web App

The app ships a web manifest (`app/manifest.ts`), generated icons
(`app/icon.tsx`, `app/apple-icon.tsx`), and a hand-written service worker
(`public/sw.js`) — installable on desktop and mobile, with an offline
app-shell fallback (`public/offline.html`) for static assets and the page
shell. Offline support is intentionally scoped to the app shell only: there's
no offline editing of leaves or visa data, since that would need real sync
logic against the remote database. Push notifications are not implemented —
see [Future Improvements](#future-improvements).

To verify installability locally, run `yarn build && yarn start` and check
Chrome DevTools → Application → Manifest, or run a Lighthouse audit.

## Error Monitoring (Sentry)

Sentry is integrated for real-time error tracking. Ensure the `SENTRY_DSN` is
set in `.env`. Errors are automatically captured on both client and server
sides. To test Sentry integration:

1. Trigger an error in development (e.g., throw an error in a component).
2. Check your Sentry dashboard for the reported issue.

## Future Improvements

- **Push notifications**: `.env` already has `NEXT_PUBLIC_VAPID_PUBLIC_KEY`/
  `VAPID_PRIVATE_KEY` configured, but there's no subscription storage,
  subscribe/unsubscribe routes, permission UI, or service worker push
  handler yet. Deliberately deferred as a separate feature from PWA
  installability.
- **Lighthouse budgets only cover the public sign-in/sign-up pages** —
  authenticated pages (dashboard, leaves, settings) have no performance
  budget, since Lighthouse CI has no logged-in session to work with.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
