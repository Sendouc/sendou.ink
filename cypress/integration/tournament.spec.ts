describe("Before tournament starts", () => {
  beforeEach(() => {
    cy.seed();
    cy.intercept(
      "GET",
      "/to/sendou/in-the-zone-x/register?_data=routes%2Fto%2F%24organization.%24tournament"
    ).as("tournaments");
  });

  it("Registers a new team", () => {
    cy.logIn("sendou");
    cy.visit("/to/sendou/in-the-zone-x");
    cy.title().should("include", "In The Zone X");
    cy.getCy("register-button").click();
    cy.getCy("team-name-input").type("Team Olive");
    cy.getCy("register-submit-button").click();
    cy.contains("Team name already taken");

    cy.wait("@tournaments");
    cy.getCy("team-name-input").clear().type("Team Olive V2");
    cy.getCy("register-submit-button").click();
    cy.url().should("include", "manage-roster");
  });

  it("Can view details of the tournament", () => {
    cy.visit("/to/sendou/in-the-zone-x");
    cy.contains("Log in to register");

    cy.getCy("map-pool-nav-link").click();
    cy.contains("23 maps");
    cy.get('[alt="Starfish Mainstage"]').should(
      "have.css",
      "filter: grayscale(100%);"
    );
  });
});
