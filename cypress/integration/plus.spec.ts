/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

context("Plus Voting History", () => {
  it("show 404 if invalid route ([[...slug]])", () => {
    cy.visit("/plus/history/asd", { failOnStatusCode: false });
    cy.contains("Not Found");

    cy.visit("/plus/history/1/2000/1", { failOnStatusCode: false });
    cy.contains("Not Found");
  });

  it("correctly calculates voting percentage", () => {});
});

context("Plus Home Page", () => {
  beforeEach(() => {
    cy.login("sendou");
    cy.visit("/plus");
  });

  it.only("correctly calculates voting percentage", () => {});
});
