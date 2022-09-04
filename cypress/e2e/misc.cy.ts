export {};

describe("404 page", () => {
  it("should say 404 if accessing URL that doesn't exist", () => {
    cy.visit("/plus/idonotexist", { failOnStatusCode: false });
    cy.contains("404");
  });
});

describe("theme switcher", () => {
  it("should switch to light mode and remember it", () => {
    cy.visit("/");
    cy.get(".dark-mode-only").should("be.visible"); // moon svg icon
    cy.getCy("theme-switch-button").click();
    cy.get(".light-mode-only").should("be.visible"); // sun svg icon
    cy.reload();
    cy.get(".light-mode-only").should("be.visible"); // sun svg icon again
  });
});
