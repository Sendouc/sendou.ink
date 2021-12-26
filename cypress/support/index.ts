import {
  ADMIN_TEST_AVATAR,
  ADMIN_TEST_DISCORD_ID,
  ADMIN_TEST_UUID,
} from "../../app/constants";
import type { LoggedInUser } from "~/utils";

export {};

type MockUser = "sendou";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      getCy(id: string): Chainable<JQuery<HTMLElement>>;
      seed(variation?: "check-in"): void;
      logIn(user: MockUser): void;
    }
  }
}

Cypress.Commands.add("getCy", (id) => {
  return cy.get(`[data-cy=${id}]`);
});

Cypress.Commands.add("seed", (variation) => {
  cy.request("POST", `seed${variation ? `?variation=${variation}` : ""}`);
});

Cypress.Commands.add("logIn", (user: MockUser) => {
  const mockUsers: Record<string, LoggedInUser> = {
    sendou: {
      id: ADMIN_TEST_UUID,
      discordId: ADMIN_TEST_DISCORD_ID,
      discordAvatar: ADMIN_TEST_AVATAR,
    },
  } as const;

  cy.intercept("http://localhost:3000/**", (req) => {
    req.headers["mock-auth"] = JSON.stringify(mockUsers[user]);
  });
});
