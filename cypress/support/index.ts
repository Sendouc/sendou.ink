Cypress.Commands.add("dataCy", (value: string) => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add("login", (user: "sendou" | "nzap") => {
  return cy.fixture(`user.${user}`).then((u) => {
    const d = new Date();
    u.iat = Math.floor(d.setHours(-168) / 1000);
    u.exp = Math.floor(d.setHours(336) / 1000);
    cy.setCookie("mockUser", JSON.stringify(u));
    cy.intercept("/api/auth/session", u);
  });
});

beforeEach(() => {
  cy.exec("npm run seed");
});
