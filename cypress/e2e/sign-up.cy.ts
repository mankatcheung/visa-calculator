describe('Sign Up Flow', () => {
  it('throws password error', () => {
    cy.visit('/en/sign-up');
    cy.getBySel('email').type('test@test.com');
    cy.getBySel('password').type('admin456');
    cy.getBySel('confirmPassword').type('admin123');
    cy.getBySel('submit').click();
    cy.contains(
      'Invalid data. Make sure the Password and Confirm Password match.'
    );
  });

  it('sign up', () => {
    cy.visit('/en/sign-up');
    cy.getBySel('email').type('test@test.com');
    cy.getBySel('password').type('admin123');
    cy.getBySel('confirmPassword').type('admin123');
    cy.getBySel('submit').click();
    // After sign-up, user lands on the verify-email page
    cy.url().should('include', '/verify-email');
    // Mark the user as verified so subsequent test specs can log in normally
    cy.task('verifyUser', 'test@test.com');
  });
});
