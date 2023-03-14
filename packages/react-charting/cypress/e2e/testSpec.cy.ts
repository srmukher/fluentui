// describe('Test 1 - zoom effect', () => {
//   it('passes 1', () => {
//     cy.visit('http://localhost:3000/iframe.html?viewMode=story&id=components-donutchart--basic');
//     cy.compareSnapshot('Donut_1');
//     // cy.get('[data-test=Donut]').should('have.length', 1);
//     // cy.get('[id*=_Pie_]').should('have.length', 2);
//   });
//   it('passes 2', () => {
//     console.log('global.innerWidth = ', global.innerWidth);
//     console.log('global.innerHeight = ', global.innerHeight);
//     global.innerWidth = global.innerWidth * 2;
//     global.innerHeight = global.innerHeight * 2;
//     global.dispatchEvent(new Event('resize'));

//     cy.visit('http://localhost:3000/iframe.html?viewMode=story&id=components-donutchart--basic');
//     cy.compareSnapshot('Donut_2');
//     // cy.get('[data-test=Donut]').should('have.length', 1);
//     // cy.get('[id*=_Pie_]').should('have.length', 2);
//   });
//   it('passes 3', () => {
//     console.log('global.innerWidth = ', global.innerWidth);
//     console.log('global.innerHeight = ', global.innerHeight);
//     global.innerWidth = 1000;
//     global.innerHeight = 1000;
//     global.dispatchEvent(new Event('resize'));

//     cy.visit('http://localhost:3000/iframe.html?viewMode=story&id=components-donutchart--basic');
//     cy.compareSnapshot('Donut_3');
//     // cy.get('[data-test=Donut]').should('have.length', 1);
//     // cy.get('[id*=_Pie_]').should('have.length', 2);
//   });
// });
// describe('Test 2 - theme effect', () => {
//   it('passes 1', () => {
//     cy.visit('http://localhost:3000/iframe.html?viewMode=story&id=components-donutchart--basic');
//     cy.compareSnapshot('Donut_4');
//   });
// });
// describe('Test 3 - text truncation', () => {
//   it('passes 1', () => {
//     cy.visit('http://localhost:3000/iframe.html?viewMode=story&id=components-donutchart--basic');
//     cy.compareSnapshot('Donut_5');
//   });
// });

describe('Test 4 - screen resolution', () => {
  it('passes 1', () => {
    // cy.viewport(200, 200);
    cy.visit('http://localhost:3000/iframe.html?viewMode=story&id=components-donutchart--basic');
    // cy.get('[data-test=Donut]').compareSnapshot('Donut_6');
    cy.get('[data-test=Donut_center_text]').first().compareSnapshot('Donut_7');
  });
});
