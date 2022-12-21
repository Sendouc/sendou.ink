import { sql } from "~/db/sql";

const createTeamMemberStm = sql.prepare(/*sql*/ `
  insert into "TournamentTeamMember" (
    "tournamentTeamId",
    "userId"
  ) values (
    @tournamentTeamId,
    @userId
  )
`);

const deleteTeamStm = sql.prepare(/*sql*/ `
  delete from "TournamentTeam"
    where "id" = @tournamentTeamId  
`);

const deleteMemberStm = sql.prepare(/*sql*/ `
  delete from "TournamentTeamMember"
  where "tournamentTeamId" = @tournamentTeamId
    and "userId" = @userId
`);

export const joinTeam = sql.transaction(
  ({
    previousTeamId,
    whatToDoWithPreviousTeam,
    newTeamId,
    userId,
  }: {
    previousTeamId?: number;
    whatToDoWithPreviousTeam?: "LEAVE" | "DELETE";
    newTeamId: number;
    userId: number;
  }) => {
    if (whatToDoWithPreviousTeam === "DELETE") {
      deleteTeamStm.run({ tournamentTeamId: previousTeamId });
    } else if (whatToDoWithPreviousTeam === "LEAVE") {
      deleteMemberStm.run({ tournamentTeamId: previousTeamId, userId });
    }

    createTeamMemberStm.run({ tournamentTeamId: newTeamId, userId });
  }
);
