export {};

describe("User page", () => {
  beforeEach(() => {
    cy.seed();
  });

  it("views profile not logged in", function () {
    cy.visit("/u/79237403620945920");
    cy.contains("Sendou");
    cy.getCy("edit-page-link").should("not.exist");
  });

  it("edits own profile", function () {
    cy.auth();
    cy.visit("/");
    cy.getCy("user-avatar").click();
    cy.getCy("profile-button").click();
    cy.getCy("edit-page-link").click();
    cy.getCy("country-select").select("FI");
    cy.getCy("submit-button").click();
    cy.getCy("profile-page-link").click();
    cy.contains("Sendou");
    cy.contains("Finland");

    // let's also check clearing select is possible
    cy.getCy("edit-page-link").click();
    cy.getCy("country-select").select(0);
    cy.getCy("submit-button").click();
    cy.getCy("profile-page-link").click();
    cy.contains("Sendou");
    cy.contains("Finland").should("not.exist");
  });
});
