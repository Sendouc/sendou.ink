import * as users from "./models/users/users.server";
import * as plusSuggestions from "./models/plusSuggestions/plusSuggestions.server";
import * as plusVotes from "./models/plusVotes/plusVotes.server";
import * as badges from "./models/badges/queries.server";
import * as calendarEvents from "./models/calendar/queries.server";

export const db = {
  users,
  plusSuggestions,
  plusVotes,
  badges,
  calendarEvents,
};
