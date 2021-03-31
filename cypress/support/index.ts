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
  // TODO: use database transactions, instead of dropping and recreating the database with each individual test
  exec("npm run seed");
});
