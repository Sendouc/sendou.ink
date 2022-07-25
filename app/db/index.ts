import * as users from "./models/users.server";
import * as plusSuggestions from "./models/plusSuggestions.server";
import * as plusVotes from "./models/plusVotes.server";
import * as badges from "./models/badges.server";
import * as calendar from "./models/calendar.server";

export const db = {
  users,
  plusSuggestions,
  plusVotes,
  badges,
  // xxx: rename to events.... or calendarEvents?
  calendar,
};
