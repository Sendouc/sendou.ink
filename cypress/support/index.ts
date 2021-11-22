export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      getCy(id: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("getCy", (value: string) => {
  return cy.get(`[data-cy=${value}]`);
});
