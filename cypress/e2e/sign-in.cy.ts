describe('Sign In Flow', () => {
  it('throws password error', () => {
    cy.visit('/en/sign-in');
    cy.login('test@test.com', 'admin456');
    cy.contains('Incorrect email or password');
  });

  it('login', () => {
    cy.visit('/en/sign-in');
    cy.login('test@test.com', 'admin123');
    cy.url().should('include', '/en');
    cy.getBySel('dashboard-content').should('be.visible');
  });
});
