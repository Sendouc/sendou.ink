import { ADMIN_DISCORD_ID } from "~/constants";
import { userBuildsPage } from "~/utils/urls";

export {};

describe("user builds tab", () => {
  beforeEach(() => {
    cy.seed();
  });

  it("views builds of other user", () => {
    cy.visit(userBuildsPage({ discordId: ADMIN_DISCORD_ID }));

    cy.getCy("build-card").its("length").should("eq", 50);

    cy.getCy("new-build-button").should("not.exist");
  });

  it("operates ability selector", () => {
    cy.auth(1);
    cy.visit(userBuildsPage({ discordId: ADMIN_DISCORD_ID }));
    cy.getCy("new-build-button").click();

    cy.getCy("UNKNOWN-ability").its("length").should("eq", 12);

    // adding main ability only works once
    for (let i = 0; i < 3; i++) {
      cy.getCy("DR-ability-button").click();
    }

    cy.getCy("DR-ability").its("length").should("eq", 1);
    cy.getCy("UNKNOWN-ability").its("length").should("eq", 11);

    // can delete ability

    cy.getCy("DR-ability").click();
    cy.getCy("UNKNOWN-ability").its("length").should("eq", 12);
  });

  it("adds a new build", () => {
    cy.auth(1);
    cy.visit(userBuildsPage({ discordId: ADMIN_DISCORD_ID }));
    cy.getCy("new-build-button").click();

    cy.getCy("weapon-combobox-input").type("Luna Blaster{enter}");
    cy.getCy("HEAD-combobox-input").type("White Headband{enter}");
    cy.getCy("CLOTHES-combobox-input").type("Black Squideye{enter}");
    cy.getCy("SHOES-combobox-input").type("Blue Lo-Tops{enter}");

    for (let i = 0; i < 12; i++) {
      cy.getCy("ISM-ability-button").click();
    }

    cy.getCy("title-input").type("My awesome build");
    cy.getCy("description-textarea").type("Does not run out of ink :-)");
    cy.getCy("SZ-checkbox").click();

    cy.getCy("submit-button").click();

    cy.getCy("build-card").first().contains("Luna Blaster");
  });

  it("edits build", () => {
    cy.auth(1);
    cy.visit(userBuildsPage({ discordId: ADMIN_DISCORD_ID }));

    cy.getCy("edit-build-button").first().click();

    const title = "My edited title";

    cy.getCy("title-input").clear().type(title);

    cy.getCy("submit-button").click();

    cy.getCy("build-card").first().contains(title);
  });

  it("deletes build", () => {
    cy.auth(1);
    cy.visit(userBuildsPage({ discordId: ADMIN_DISCORD_ID }));

    cy.contains("Builds (50)");
    cy.getCy("delete-build-button").first().click();
    cy.getCy("confirm-button").first().click();
    cy.contains("Builds (49)");
  });
});
