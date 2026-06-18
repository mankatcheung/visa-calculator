// cypress/support/commands.ts
// Add custom commands here if needed
import type { Result } from 'axe-core';
import 'cypress-axe';

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

function logA11yViolations(violations: Result[]) {
  cy.task(
    'log',
    `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} detected`
  );
  cy.task(
    'table',
    violations.flatMap(({ id, nodes }) =>
      nodes.map((n) => ({ id, target: n.target.join(' '), html: n.html }))
    )
  );
}

Cypress.Commands.add('checkA11yAndLog', () => {
  cy.injectAxe();
  cy.checkA11y(undefined, undefined, logA11yViolations);
});

Cypress.Commands.add('login', (email, password) => {
  const signInPath = '/en/sign-in';

  cy.location('pathname', { log: false }).then((currentPath) => {
    if (currentPath !== signInPath) {
      cy.visit(signInPath);
    }
  });

  cy.getBySel('email').type(email);
  cy.getBySel('password').type(password);
  cy.getBySel('submit').click();
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      getBySel(selector: any, ...args: []): Chainable<any>;
      login(email: string, password: string): Chainable<any>;
      checkA11yAndLog(): Chainable<any>;
    }
  }
}

Cypress.on('uncaught:exception', (err) => {
  console.log('Uncaught exception:', err);
  return false; // Prevent Cypress from failing the test
});
