describe("Before tournament starts", () => {
  beforeEach(() => {
    cy.seed("check-in");
    cy.logIn("sendou");
  });

  it.only("Can edit team details, add/remove players and check-in", () => {
    cy.visit("/to/sendou/in-the-zone-x/manage-roster", {
      onBeforeLoad(win: Window): void {
        cy.spy(win.navigator.clipboard, "writeText").as("copy");
      },
    });
    cy.getCy("check-in-alert");
    cy.getCy("remove-player-button").first().click();
    cy.getCy("not-enough-players-warning");

    cy.getCy("copy-to-clipboard-button").click();
    cy.get("@copy").should(
      "be.calledWithExactly",
      `http://localhost:3000/to/sendou/in-the-zone-x/join-team?code=033e3695-0421-4aa1-a5ef-6ee82297a398`
    );
    cy.getCy("add-to-roster-button").click();
    cy.getCy("check-in-button").click();
    cy.getCy("checked-in-alert");
  });
});
