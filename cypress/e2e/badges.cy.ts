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

  it("edits badge managers", function () {
    cy.auth(1);
    cy.visit(BADGES_PAGE);

    cy.getCy("badge-nav-link").first().click();
    cy.getCy("edit-button").click();

    cy.getCy("delete-manager-button").click();
    cy.getCy("new-manager-combobox-input").clear().type("Sendou{enter}");
    cy.contains("2 changes").click();

    cy.contains("Managed by Sendou");
  });

  it("edits adds badge owner", function () {
    cy.auth(2);
    cy.visit(BADGES_PAGE);

    cy.getCy("badge-nav-link").first().click();
    cy.getCy("edit-button").click();

    cy.getCy("new-owner-combobox-input").clear().type("N-ZAP{enter}");
    cy.getCy("owner-count-input").last().type("1"); // new count = 11

    cy.contains("1 change").click();
    cy.contains("11");
  });

  it("removes badge owner", function () {
    cy.auth(2);
    cy.visit(BADGES_PAGE);

    cy.getCy("badge-nav-link").first().click();
    cy.getCy("badge-owner")
      .first()
      .invoke("text")
      .then((previousContent) => {
        cy.getCy("edit-button").click();

        cy.getCy("owner-count-input").first().type("{selectall}").type("0");

        cy.contains("1 change").click();

        cy.visit(BADGES_PAGE);
        cy.getCy("badge-nav-link").first().click();
        cy.getCy("badge-owner")
          .first()
          .invoke("text")
          .should("not.equal", previousContent);
      });
  });
});
