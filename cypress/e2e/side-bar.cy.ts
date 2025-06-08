describe('Navigation', () => {
  it('navigates to main page', () => {
    cy.login('test@test.com', 'admin123');
    cy.getBySel('side-bar-item-summary').click();
    cy.url().should('include', '/');
  });

  it('navigates to leaves page', () => {
    cy.login('test@test.com', 'admin123');
    cy.getBySel('side-bar-item-leaves').click();
    cy.url().should('include', '/leaves');
  });

  it('navigates to user settings', () => {
    cy.login('test@test.com', 'admin123');
    cy.getBySel('side-bar-item-users-settings').click();
    cy.url().should('include', 'users/settings');

    cy.getBySel('user-settings-content').should('be.visible');
  });
});
