/// <reference types="cypress" />

describe("Map Planner", () => {
  beforeEach(() => {
    cy.visit("/plans");
  });

  it("renders canvas", () => {
    cy.get("canvas");
  });
});

export {};
