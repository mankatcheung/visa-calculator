// cypress/support/commands.ts
// Add custom commands here if needed
Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
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

declare namespace Cypress {
  interface Chainable<Subject = any> {
    getBySel(selector: any, ...args: []): Chainable<any>;
    login(email: string, password: string): Chainable<any>;
  }
}

// Cypress.on('uncaught:exception', (err, runnable) => {
//   console.log('Uncaught exception:', err);
//   return false; // Prevent Cypress from failing the test
// });
