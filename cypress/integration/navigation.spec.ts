describe("Desktop navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Links lead to new pages", () => {
    cy.getCy("nav-link-sendouq").click();
    cy.contains("Rules");
  });

  it("Directs log in to backend", () => {
    cy.getCy("log-in-button").should("not.be.disabled");
    cy.getCy("log-in-form")
      .should("have.attr", "action")
      .and("include", "/auth/discord");
  });
});

describe("Mobile navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.viewport(320, 568);
  });

  it("Opens mobile nav and links lead to a new page", () => {
    cy.getCy("hamburger-button").click();
    cy.getCy("mobile-nav-link-sendouq").click({ scrollBehavior: "bottom" });
    cy.contains("Rules");
  });

  it("Directs log in to backend", () => {
    cy.getCy("log-in-button").should("not.be.disabled");
    cy.getCy("log-in-form")
      .should("have.attr", "action")
      .and("include", "/auth/discord");
  });
});
