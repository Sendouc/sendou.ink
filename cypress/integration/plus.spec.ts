import { PLUS_SUGGESTIONS_PAGE } from "~/utils/urls";

export {};

describe("Plus suggestions page", () => {
  beforeEach(() => {
    cy.seed();
  });

  it("views suggestions status as non plus member", function () {
    cy.auth(150);
    cy.visit(PLUS_SUGGESTIONS_PAGE);
    cy.contains("You are suggested");
  });

  it("adds a comment and deletes one", () => {
    cy.auth();
    cy.visit(PLUS_SUGGESTIONS_PAGE);
    cy.getCy("plus2-radio").click();
    cy.getCy("comment-button").first().click();

    cy.url().should("include", "/2/"); // let's check the radio button click did something
    cy.getCy("comment-textarea").type("Cracked!");
    cy.getCy("submit-button").click();

    cy.contains("Cracked!");

    cy.getCy("comments-summary").first().click();
    cy.getCy("delete-comment-button").first().click();
    cy.getCy("confirm-button").click();
    cy.contains("Cracked!").should("not.exist");
  });

  it("adds a new suggestion, validates suggested user and deletes it", () => {
    cy.clock(new Date(Date.UTC(2022, 5, 15))); // let's make sure voting is not happening
    cy.auth();
    cy.visit(PLUS_SUGGESTIONS_PAGE);

    cy.getCy("new-suggest-button").click();
    cy.getCy("tier-select").select("2");
    cy.getCy("user-combobox-input").type("Sendou{enter}");

    cy.contains("This user already has access");
    cy.getCy("submit-button").should("be.disabled");

    cy.getCy("user-combobox-input").clear().type("N-ZAP{enter}");
    cy.getCy("comment-textarea").type("So good");
    cy.getCy("submit-button").click();

    cy.getCy("plus2-radio").click();
    cy.contains("N-ZAP");

    cy.getCy("comments-summary").first().click();
    cy.getCy("delete-comment-button").first().click();
    cy.getCy("confirm-button").click();
    cy.contains("N-ZAP").should("not.exist");
  });
});

describe("Plus voting results page", () => {
  beforeEach(() => {
    cy.seed();
  });

  it("views results and sees own percentage as a failed suggest", () => {
    cy.auth(200);
    cy.visit("/plus/voting/results");

    cy.contains("Sendou");
    cy.contains("your score was");
  });
});
