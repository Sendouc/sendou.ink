/// <reference types="cypress" />

context("Actions", () => {
  // beforeEach(() => {
  //   cy.visit('/plus/history')
  // })

  it("show 404 if invalid route ([[...slug]])", () => {
    cy.visit("/plus/history/asd", { failOnStatusCode: false });
    cy.contains("Not Found");

    cy.visit("/plus/history/1/2000/1", { failOnStatusCode: false });
    cy.contains("Not Found");
  });
});
