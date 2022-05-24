export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getCy(id: string): Chainable<JQuery<HTMLElement>>;
      seed(): void;
      auth(userId?: number): void;
    }
  }
}

Cypress.Commands.add("getCy", (id) => {
  return cy.get(`[data-cy=${id}]`);
});

// TODO: make this a request instead... probably faster?
Cypress.Commands.add("seed", () => {
  cy.exec("npm run seed");
});

Cypress.Commands.add("auth", (id = 1) => {
  cy.request("POST", `/auth/impersonate?id=${id}`);
});
