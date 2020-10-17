/// <reference types="cypress" />

import { theme } from "theme";

describe("Layout", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("changes color mode with correct bg color", () => {
    cy.get("body").should("have.backgroundColor", theme.light.bgColor);
    cy.get("[data-cy=color-mode-toggle]").click();
    cy.get("body").should("have.backgroundColor", theme.dark.bgColor);
  });
});
