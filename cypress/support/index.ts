export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getCy(id: string): Chainable<JQuery<HTMLElement>>;
      seed(): void;
      auth(): void;
    }
  }
}

Cypress.Commands.add("getCy", (id) => {
  return cy.get(`[data-cy=${id}]`);
});

Cypress.Commands.add("seed", () => {
  cy.exec("npm run seed");
});

const SENDOU_COOKIE =
  "eyJvYXV0aDI6c3RhdGUiOiJhMDE0MjI5Mi03YjRiLTRkYTYtYWQxZC1jMTI5ZWExZGVhNjUiLCJ1c2VyIjp7ImlkIjoxLCJkaXNjb3JkSWQiOiI3OTIzNzQwMzYyMDk0NTkyMCIsImRpc2NvcmRBdmF0YXIiOiJmY2ZkNjVhM2JlYTU5ODkwNWFiYjljYTI1Mjk2ODE2YiJ9LCJzdHJhdGVneSI6ImRpc2NvcmQifQ%3D%3D.yf5YER%2B15VPqVk6Kys2jnpPAQqbq2Yv%2FF50lmGAIilc";

Cypress.Commands.add("auth", () => {
  cy.setCookie("_session", SENDOU_COOKIE);
});
