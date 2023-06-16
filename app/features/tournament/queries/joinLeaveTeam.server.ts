import invariant from "tiny-invariant";
import { sql } from "~/db/sql";
import { checkOut } from "./checkOut.server";
import { deleteSub } from "~/features/tournament-subs";

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

// TODO: if captain leaves don't delete but give captain to someone else
export const joinTeam = sql.transaction(
  ({
    previousTeamId,
    whatToDoWithPreviousTeam,
    newTeamId,
    userId,
    tournamentId,
    checkOutTeam = false,
  }: {
    previousTeamId?: number;
    whatToDoWithPreviousTeam?: "LEAVE" | "DELETE";
    newTeamId: number;
    userId: number;
    tournamentId: number;
    checkOutTeam?: boolean;
  }) => {
    if (whatToDoWithPreviousTeam === "DELETE") {
      deleteTeamStm.run({ tournamentTeamId: previousTeamId });
    } else if (whatToDoWithPreviousTeam === "LEAVE") {
      deleteMemberStm.run({ tournamentTeamId: previousTeamId, userId });
    }

    if (!previousTeamId) {
      deleteSub({ tournamentId, userId });
    }

    if (checkOutTeam) {
      invariant(
        previousTeamId,
        "previousTeamId is required when checking out team"
      );
      checkOut(previousTeamId);
    }

    createTeamMemberStm.run({ tournamentTeamId: newTeamId, userId });
  }
);

export const leaveTeam = ({
  teamId,
  userId,
}: {
  teamId: number;
  userId: number;
}) => {
  deleteMemberStm.run({ tournamentTeamId: teamId, userId });
};
