export {};

describe("404 page", () => {
  it("should say 404 if accessing URL that doesn't exist", () => {
    cy.visit("/plus/idonotexist", { failOnStatusCode: false });
    cy.contains("404");
  });
});
