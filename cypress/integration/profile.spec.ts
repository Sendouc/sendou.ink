/// <reference types="cypress" />

describe("Profile", () => {
  beforeEach(() => {
    cy.visit("/u/455039198672453645");
  });

  it("loads avatar", () => {
    cy.get("[data-cy=profile-page-avatar]").find("img");
  });

  it("renders markdown", () => {
    cy.get("strong");
  });
});
