export {};

describe("Plus suggestions page", () => {
  beforeEach(() => {
    cy.seed();
  });

  it("views suggestions status as non plus member", function () {
    cy.auth(150);
    cy.visit("/plus");
    cy.contains("You are suggested");
  });
});
