describe('Navigation', () => {
  it('navigates to sign in page', () => {
    // Start from the index page
    cy.visit('/');
    // The new url should include "/about"
    cy.url().should('include', '/sign-in');
  });

  it('navigates to sign up page', () => {
    cy.visit('/');
    cy.getBySel('sign-up').click();
    cy.url().should('include', '/sign-up');
  });

  it('navigates to chinese', () => {
    cy.visit('/');
    cy.getBySel('locale-zh-Hant-HK').click();
    cy.url().should('include', 'zh-Hant-HK');
  });

  it('navigates to english', () => {
    cy.visit('/');
    cy.getBySel('locale-en').click();
    cy.url().should('include', 'en');
  });
});
