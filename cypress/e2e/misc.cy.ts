export {};

beforeEach(() => {
  cy.clearLocalStorage();
  cy.visit("/");
});

/**
 * Note: function() is preferred over arrow functions for access to this.*
 * Reference: https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Avoiding-the-use-of-this
 */
describe("404 page", () => {
  it("should say 404 if accessing URL that doesn't exist", function() {
    cy.visit("/plus/idonotexist", { failOnStatusCode: false });
    cy.contains("404");
  });
});

describe("theme switcher", () => {
  /**
   * Attempting to import the constant from the Theme module breaks the Cypress tests"
   * 
   * import { THEME_LOCAL_STORAGE_KEY } from "~/modules/theme";
   * 
   * , so we have to hard-code this to test localStorage.
   */
  const THEME_LOCAL_STORAGE_KEY = "theme-preference";

  it("should start on Light Mode and remember it", function() {
    cy.get(".light-mode-only").should("be.visible"); // sun svg icon
    cy.reload().then(() => {
      cy.get(".light-mode-only").should("be.visible"); // sun svg icon again
    });
  });

  it("should switch to Dark Mode and remember it", function() {
    cy.get(".light-mode-only").should("be.visible"); // sun svg icon

    cy.getCy("theme-switch-button").click().then(() => {
      cy.get(".dark-mode-only").should("be.visible"); // moon svg icon
      cy.reload().then(() => {
        cy.get(".dark-mode-only").should("be.visible"); // moon svg icon again
      });      
    });
  });

  it("should start on Light Mode, switch to Dark Mode and remember it, then switch back to Light Mode properly", function() {
    cy.get(".light-mode-only").should("be.visible"); // sun svg icon

    cy.getCy("theme-switch-button").click().then(() => {
      cy.get(".dark-mode-only").should("be.visible"); // moon svg icon
      cy.reload().then(() => {
        cy.get(".dark-mode-only").should("be.visible"); // moon svg icon again

        cy.getCy("theme-switch-button").click().then(() => {
          cy.get(".light-mode-only").should("be.visible"); // sun svg icon, second time
        });
      });
    });
  });

  it("should start on Light Mode if the localStorage key is set to be light", function() {
    localStorage.setItem(THEME_LOCAL_STORAGE_KEY, 'light');
    cy.visit("/"); // Re-visit the page after localStorage key-value pair is set
    cy.get(".light-mode-only").should("be.visible"); // moon svg icon
  });

  it("should start on Dark Mode if the localStorage key is set to be dark", function() {
    localStorage.setItem(THEME_LOCAL_STORAGE_KEY, 'dark');
    cy.visit("/"); // Re-visit the page after localStorage key-value pair is set
    cy.get(".dark-mode-only").should("be.visible"); // moon svg icon
  });
});
