describe('Terms and Conditions page', () => {
  it('is reachable without being logged in', () => {
    cy.visit('/en/terms');
    cy.url().should('include', '/terms');
    cy.getBySel('terms-content').should('be.visible');
    cy.contains('Terms and Conditions');
  });

  it('is linked from the sign-up page', () => {
    cy.visit('/en/sign-up');
    cy.getBySel('terms').click();
    cy.url().should('include', '/terms');
    cy.getBySel('terms-content').should('be.visible');
  });
});
