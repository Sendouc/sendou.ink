/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

context("Event Calendar", () => {
  it("don't show event of the past", () => {
    cy.visit("/calendar");
    // event is in the past
    cy.dataCy("event-info-section-should-not-show").should("not.exist");
  });

  it("tournament info renders as expected", () => {
    cy.visit("/calendar");
    cy.contains("In The Zone Ultimate");
    cy.contains("SZ Only");

    cy.dataCy("event-info-section-in-the-zone-ultimate")
      .contains("Ultimate zoning")
      .should("not.exist");
    cy.dataCy("info-button-in-the-zone-ultimate").click();
    cy.dataCy("event-info-section-in-the-zone-ultimate").contains(
      "Ultimate zoning"
    );
  });

  it("tournament can be created", () => {
    cy.login("sendou");
    cy.visit("/calendar");

    cy.dataCy("event-info-section-test-event").should("not.exist");

    cy.dataCy("add-event-button").click();
    cy.dataCy("name-input").type("Test Event");
    cy.dataCy("discord-invite-url-input").type("https://discord.gg/sendou");
    cy.dataCy("registration-url-input").type(
      "https://sendous.challonge.com/InTheZone24"
    );
    cy.dataCy("description-markdown").type(
      "go register amazing test event and all that"
    );
    cy.dataCy("save-button").click();

    cy.dataCy("event-info-section-test-event");
  });

  it("tournament can be edited and deleted", () => {
    cy.login("sendou");
    cy.visit("/calendar");

    cy.dataCy("info-button-in-the-zone-ultimate").click();
    cy.dataCy("event-info-section-in-the-zone-ultimate").contains(
      "Ultimate zoning"
    );

    cy.dataCy("edit-button-in-the-zone-ultimate").click();
    cy.dataCy("description-markdown").clear().type("description edited");
    cy.dataCy("save-button").click();
    cy.dataCy("event-info-section-in-the-zone-ultimate").contains(
      "description edited"
    );

    cy.dataCy("edit-button-in-the-zone-ultimate").click();
    cy.on("window:confirm", () => true);
    cy.dataCy("delete-button").click();
    cy.dataCy("event-info-section-in-the-zone-ultimate").should("not.exist");
  });
});
