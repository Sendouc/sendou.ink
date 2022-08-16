import * as users from "./models/users/queries.server";
import * as plusSuggestions from "./models/plusSuggestions/queries.server";
import * as plusVotes from "./models/plusVotes/queries.server";
import * as badges from "./models/badges/queries.server";
import * as calendarEvents from "./models/calendar/queries.server";

export const db = {
  users,
  plusSuggestions,
  plusVotes,
  badges,
  calendarEvents,
};
