describe('Sign In Flow', () => {
  it('throws password error', () => {
    cy.visit('/en/sign-in');
    cy.login('test@test.com', 'admin456');
    cy.contains('Incorrect email or password');
  });

  it('login', () => {
    cy.visit('/en/sign-in');
    cy.getBySel('email').type('test@test.com');
    cy.getBySel('password').type('admin123');
    cy.getBySel('submit').click();
    cy.wait(5000);
    cy.url().should('equal', 'http://localhost:3000/en');
  });
});
