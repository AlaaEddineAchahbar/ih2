describe('Sample test case', () => {
  it('Visits the initial project page', () => {
    cy.visit(Cypress.env('products_url'));
  });

  /**
   * Check if page contains boilerplate
   */
  it('Page contains Boilerplate', () => {
    cy.get('h1').contains('Boilerplate for Angular 13 Projects');
});
});
