describe('Navigation', () => {
  it('navigates to main page', () => {
    cy.login('test@test.com', 'admin123');
    cy.getBySel('side-bar-item-visaCalculator').click();
    cy.url().should('include', '/');
  });

  it('navigates to english', () => {
    cy.login('test@test.com', 'admin123');
    cy.getBySel('side-bar-item-users-settings').click();
    cy.url().should('include', 'users/setting123');
  });
});
