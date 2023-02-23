import 'cypress-iframe';

// describe('template spec', () => {
//   it('passes', () => {
//     cy.visit('https://example.cypress.io');
//   });
// });

const getIframeDocument = () => {
  return (
    cy
      .get('#storybook-preview-iframe')
      // Cypress yields jQuery element, which has the real
      // DOM element under property "0".
      // From the real DOM iframe element we can get
      // the "document" element, it is stored in "contentDocument" property
      // Cypress "its" command can access deep properties using dot notation
      // https://on.cypress.io/its
      .its('0.contentDocument')
      .should('exist')
  );
};

const getIframeBody = () => {
  // get the document
  return (
    getIframeDocument()
      // automatically retries until body is loaded
      .its('body')
      .should('not.be.undefined')
      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      .then(cy.wrap)
  );
};

// describe('Test 1', () => {
//   it('passes', () => {
//     cy.visit('http://localhost:3000/');
//   });

//   it('passes 1', () => {
//     cy.visit('http://localhost:3000/?path=/story/components-donutchart--basic');
//     cy.log('I am here');
//     cy.frameLoaded('#storybook-preview-iframe');
//     cy.enter('#storybook-preview-iframe').then(getBody => {
//       getBody().then(cy.wrap).get('#root').get('[id*="_Pie_"]');
//     });
//   });
// });

describe('Test 1', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/?path=/story/components-donutchart--basic');
  });

  it('passes 1', () => {
    cy.visit('http://localhost:3000/iframe.html?viewMode=story&id=components-donutchart--basic');
    cy.get('[data-test=Donut]').should('have.length', 1);
    cy.get('[id*=_Pie_]').should('have.length', 2);
    // cy.log(cy.get('[data-test=Donut]').find('text'));
    // cy.get('text').should('have.text', '39,000');
  });
});
