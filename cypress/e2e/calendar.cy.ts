import { dateToYearMonthDayHourMinuteString } from "~/utils/dates";
import {
  calendarEditPage,
  calendarEventPage,
  CALENDAR_PAGE,
} from "~/utils/urls";

export {};

describe("Calendar", () => {
  beforeEach(() => {
    cy.seed();
  });

  it("browses weeks and inspects one event page", () => {
    cy.visit(CALENDAR_PAGE);

    cy.contains("Last").click();
    cy.contains("Next").click();
    cy.getCy("event-page-link").first().click();
    cy.getCy("event-description"); // page switched after link click
  });

  it("visits week via search params & displays no events", () => {
    cy.visit(`${CALENDAR_PAGE}?week=1&year=2020`);
    cy.getCy("no-events");
  });
});

describe("New calendar event page", () => {
  beforeEach(() => {
    cy.seed();
  });

  it("operates custom form controls", () => {
    cy.auth(2);
    cy.visit(calendarEditPage());

    // dates

    cy.getCy("date-input").type(
      dateToYearMonthDayHourMinuteString(new Date(Date.UTC(2022, 5, 20)))
    );
    cy.getCy("add-date-button").click();
    cy.getCy("date-input")
      .eq(1) // get second date input
      .clear()
      .type(
        dateToYearMonthDayHourMinuteString(new Date(Date.UTC(2022, 5, 21)))
      );
    cy.getCy("add-date-button").click();

    cy.getCy("date-input").its("length").should("equal", 3);
    cy.getCy("remove-date-button").click();
    cy.getCy("date-input").its("length").should("equal", 2);

    // tags

    cy.getCy("tags-select").select("ART");
    cy.getCy("tags-select").select("MONEY");
    cy.getCy("tag-delete-button").its("length").should("eq", 2);
    cy.getCy("tag-delete-button").first().click();
    cy.getCy("tag-delete-button").its("length").should("eq", 1);

    // badges

    cy.getCy("badges-select").select(1);
    cy.getCy("badges-select").select(2);
    cy.getCy("badge-delete-button").its("length").should("eq", 2);
    cy.getCy("badge-delete-button").first().click();
    cy.getCy("badge-delete-button").its("length").should("eq", 1);
  });

  it("adds a new event", () => {
    cy.auth(2);
    cy.visit(calendarEditPage());

    cy.getCy("name-input").type("In The Test");
    cy.getCy("description-textarea").type(
      "My greatest event of all time...You are not ready for this."
    );
    cy.getCy("date-input").type(
      dateToYearMonthDayHourMinuteString(new Date(Date.UTC(2022, 5, 20)))
    );
    cy.getCy("bracket-url-input").type("https://bracket.com");
    cy.getCy("discord-invite-code-input").type("asdFGKHL");
    cy.getCy("tags-select").select("MONEY");
    cy.getCy("badges-select").select(1);

    cy.getCy("submit-button").click();
    cy.url().should("include", "/201"); // we should have been redirected to the new event's page
  });

  it("edits an event", () => {
    cy.auth(2);

    cy.visit(calendarEventPage(1));
    cy.getCy("edit-button").click();

    cy.getCy("name-input").clear().type("Edited Event");

    cy.getCy("submit-button").click();
    cy.url().should("include", "/1"); // we should have been redirected to the new event's page
    cy.contains("Edited Event");
  });

  describe("Results", () => {
    it("Adds results to tournament", () => {
      cy.auth(2);

      cy.visit(calendarEventPage(1));
      cy.getCy("report-winners-button").click();

      cy.getCy("participants-count-input").type("24");

      cy.getCy("team-name-input").type("Team Olive");

      for (let i = 0; i < 4; i++) {
        cy.getCy("change-input-type-button").eq(i).click();
        cy.getCy("plain-player-name-input")
          .eq(i)
          .type(`Player ${i + 1}`);
      }

      cy.getCy("add-player-button").first().click();
      cy.getCy("team-player-combobox-input").clear().type("Sendou{enter}");

      cy.getCy("add-team-button").click();

      cy.getCy("team-name-input").eq(1).type("NSTC");
      cy.getCy("placing-input").eq(1).clear().type("8");

      for (let i = 0; i < 3; i++) {
        cy.getCy("remove-player-button").eq(1).click();
      }
      cy.getCy("change-input-type-button").eq(5).click();
      cy.getCy("plain-player-name-input").eq(4).type(`fuzzy`);

      cy.getCy("submit-button").click();

      // checking that added results show

      cy.contains("8th");
      cy.contains("Sendou").click();

      cy.contains("Results").click();
      cy.contains("Player 1");
    });
  });
});
