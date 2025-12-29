declare namespace Cypress {
  interface Chainable<Subject = any> {
    getBySel(selector: any, ...args: []): Chainable<any>;
    login(email: string, password: string): Chainable<any>;
  }
}
