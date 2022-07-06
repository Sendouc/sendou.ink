import { BADGES_PAGE } from "~/utils/urls";

export {};

describe("Plus suggestions page", () => {
  beforeEach(() => {
    cy.seed();
  });

  it("browses the badges not logged in", function () {
    cy.visit(BADGES_PAGE);

    cy.getCy("badge-nav-link").first().click();
    cy.contains("Awarded for winning");
    cy.getCy("edit-button").should("not.exist");
  });
});
