# UK Visa Leave Tracker

A web application for recording and tracking the number of leaves (absences) for
UK visa compliance, built with Next.js, following clean architecture principles,
and equipped with robust tools for scalability, internationalization, testing,
and monitoring.

## Tech Stack

- **Next.js**: React framework for server-side rendering, static site
  generation, and API routes.
- **Drizzle ORM with Turso**: Lightweight TypeScript ORM for efficient database
  operations with Turso as the database.
- **Yarn**: Fast and reliable package manager for dependency management.
- **Clean Architecture**: Modular structure for maintainability and scalability.
- **Next-Intl**: Internationalization (i18n) for multi-language support.
- **Cypress**: End-to-end testing framework for reliable UI testing.
- **Vitest**: Fast unit testing framework for testing components and logic.
- **Sentry**: Real-time error tracking and monitoring for bug detection.
- **Codecov**: Code coverage reporting to ensure test quality.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- Yarn (v1.22 or higher)
- A Turso database instance (with connection details)
- A Sentry account (for error monitoring, optional)
- A Codecov account (for code coverage reporting, optional)

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
   ```

   Replace `your-turso-database-url`, `your-turso-auth-token`,
   `your-sentry-dsn`, and `your-sentry-auth-token` with your respective
   credentials.

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
- `yarn test`: Run unit tests with Vitest.
- `yarn cy:run`: Run end-to-end tests with Cypress.
- `yarn lint`: Run ESLint for code linting.
- `yarn coverage`: Generate and upload code coverage report to Codecov.

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

### Unit Tests (Vitest)

Run unit tests to verify individual components and logic:

```bash
yarn test
```

### End-to-End Tests (Cypress)

Run e2e tests to simulate user interactions, such as recording a leave:

```bash
yarn cy:run
```

To open the Cypress test runner:

```bash
yarn cy:open
```

### Code Coverage (Codecov)

Generate and upload coverage reports:

```bash
yarn coverage
```

View coverage reports on your Codecov dashboard.

## Error Monitoring (Sentry)

Sentry is integrated for real-time error tracking. Ensure the `SENTRY_DSN` is
set in `.env`. Errors are automatically captured on both client and server
sides. To test Sentry integration:

1. Trigger an error in development (e.g., throw an error in a component).
2. Check your Sentry dashboard for the reported issue.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
