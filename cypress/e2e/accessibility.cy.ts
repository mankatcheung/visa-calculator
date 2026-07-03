describe('Accessibility', () => {
  it('sign-in page has no detectable a11y violations', () => {
    cy.visit('/en/sign-in');
    cy.checkA11yAndLog();
  });

  it('sign-up page has no detectable a11y violations', () => {
    cy.visit('/en/sign-up');
    cy.checkA11yAndLog();
  });

  it('terms page has no detectable a11y violations', () => {
    cy.visit('/en/terms');
    cy.getBySel('terms-content').should('be.visible');
    cy.checkA11yAndLog();
  });

  it('dashboard page has no detectable a11y violations', () => {
    cy.login('test@test.com', 'admin123');
    cy.getBySel('dashboard-content').should('be.visible');
    cy.checkA11yAndLog();
  });

  it('leaves page has no detectable a11y violations', () => {
    cy.login('test@test.com', 'admin123');
    cy.getBySel('dashboard-content').should('be.visible');
    cy.visit('/en/leaves');
    cy.checkA11yAndLog();
  });

  it('create leave page has no detectable a11y violations', () => {
    cy.login('test@test.com', 'admin123');
    cy.getBySel('dashboard-content').should('be.visible');
    cy.visit('/en/leaves/create');
    cy.checkA11yAndLog();
  });

  it('user settings page has no detectable a11y violations', () => {
    cy.login('test@test.com', 'admin123');
    cy.getBySel('dashboard-content').should('be.visible');
    cy.visit('/en/users/settings');
    cy.getBySel('user-settings-content').should('be.visible');
    cy.checkA11yAndLog();
  });
});
