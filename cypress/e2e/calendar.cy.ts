import { dateToYearMonthDayHourMinuteString } from "~/utils/dates";
import { calendarEditPage } from "~/utils/urls";

export {};

describe("New calendar event page", () => {
  beforeEach(() => {
    cy.seed();
  });

  it("operates custom form controls", function () {
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
});
