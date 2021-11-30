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
      seed(): void;
      logIn(user: MockUser): void;
    }
  }
}

Cypress.Commands.add("getCy", (value: string) => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add("seed", () => {
  cy.request("POST", "seed");
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
