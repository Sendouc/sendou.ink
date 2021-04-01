/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

context.only("Event Calendar", () => {
  beforeEach(() => {
    cy.visit("/calendar");
  });

  it("don't show event of the past", () => {
    cy.contains("58.3%").should("not.exist");
  });

  it.only("tournament info renders as expected", () => {
    cy.contains("In The Zone Ultimate");
    cy.contains("SZ Only");

    cy.contains("Ultimate zoning").should("not.exist");
    cy.dataCy("info-button-id-12").click();
    cy.contains("Ultimate zoning");
  });
});
