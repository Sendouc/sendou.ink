/// <reference types="cypress" />

describe("Profile", () => {
  beforeEach(() => {
    cy.visit("/u/455039198672453645");
  });

  it("avatar loads", () => {
    cy.get("[data-cy=profile-page-avatar]").find("img");
  });
});
