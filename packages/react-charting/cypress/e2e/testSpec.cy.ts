describe('Test 1', () => {
  it('passes 1', () => {
    cy.visit('http://localhost:3000/iframe.html?viewMode=story&id=components-donutchart--basic');
    cy.compareSnapshot('Donut');
    // cy.log(cy.get('[data-test=Donut]').find('text'));
    // cy.get('text').should('have.text', '39,000');
    // cy.get('[data-test=Donut]').should('have.length', 1);
    // cy.get('[id*=_Pie_]').should('have.length', 2);
  });
});
