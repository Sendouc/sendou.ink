import * as users from "./models/users/queries.server";
import * as plusSuggestions from "./models/plusSuggestions/queries.server";
import * as plusVotes from "./models/plusVotes/queries.server";
import * as builds from "./models/builds/queries.server";

export const db = {
  users,
  plusSuggestions,
  plusVotes,
  builds,
};
