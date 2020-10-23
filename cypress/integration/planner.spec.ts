/// <reference types="cypress" />

describe.only("Map Planner", () => {
  beforeEach(() => {
    cy.visit("/plans");
  });

  it("renders canvas", () => {
    cy.get("canvas");
  });
});
