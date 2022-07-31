import { dateToYearMonthDayHourMinuteString } from "~/utils/dates";
import { calendarEditPage } from "~/utils/urls";

export {};

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
      .clear()
      .type(
        dateToYearMonthDayHourMinuteString(new Date(Date.UTC(2022, 5, 21)))
      );
    cy.getCy("add-date-button").click();

    cy.getCy("date-delete-button").its("length").should("eq", 2);
    cy.getCy("date-delete-button").first().click();
    cy.getCy("date-delete-button").its("length").should("eq", 1);

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
    cy.getCy("add-date-button").click();
    cy.getCy("bracket-url-input").type("https://bracket.com");
    cy.getCy("discord-invite-code-input").type("asdFGKHL");
    cy.getCy("tags-select").select("MONEY");
    cy.getCy("badges-select").select(1);

    cy.getCy("submit-button").click();
    cy.url().should("include", "101"); // we should have been redirected to the new event's page
  });
});
