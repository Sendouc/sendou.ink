import * as user from "./models/user";
import * as organization from "./models/organization";
import * as tournament from "./models/tournament";
import * as tournamentTeam from "./models/tournamentTeam";
import * as tournamentBracket from "./models/tournamentBracket";

export const db = {
  user,
  organization,
  tournament,
  tournamentTeam,
  tournamentBracket,
};
