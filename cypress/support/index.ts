export {};

type MockUser = "sendou";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      getCy(id: string): Chainable<JQuery<HTMLElement>>;
      seed(): void;
      logIn(user: MockUser): void;
    }
  }
}

Cypress.Commands.add("getCy", (value: string) => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add("seed", () => {
  cy.exec("npm run seed:reset");
});

Cypress.Commands.add("logIn", (user: MockUser) => {
  const mockUsers = {
    sendou: {
      id: 1,
      discordId: "79237403620945920",
      discordAvatar: "fcfd65a3bea598905abb9ca25296816b",
    },
  } as const;

  cy.intercept("*", (req) => {
    req.headers["mock-auth"] = JSON.stringify(mockUsers[user]);
  });
});
