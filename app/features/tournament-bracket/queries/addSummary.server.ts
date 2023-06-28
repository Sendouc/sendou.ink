import { sql } from "~/db/sql";
import type { TournamentSummary } from "../core/summarizer.server";
import { ordinal } from "openskill";
import type { Skill } from "~/db/types";

const addSkillStm = sql.prepare(/* sql */ `
  insert into "Skill" (
    "tournamentId",
    "mu",
    "sigma",
    "ordinal",
    "userId",
    "identifier",
    "matchesCount"
  )
  values (
    @tournamentId,
    @mu,
    @sigma,
    @ordinal,
    @userId,
    @identifier,
    @matchesCount + coalesce((select max("matchesCount") from "Skill" where "userId" = @userId or "identifier" = @identifier group by "userId", "identifier"), 0)
  ) returning *
`);

const addSkillTeamUserStm = sql.prepare(/* sql */ `
  insert into "SkillTeamUser" (
    "skillId",
    "userId"
  ) values (
    @skillId,
    @userId
  ) on conflict("skillId", "userId") do nothing
`);

const addMapResultDeltaStm = sql.prepare(/* sql */ `
  insert into "MapResult" (
    "mode",
    "stageId",
    "userId",
    "wins",
    "losses"
  ) values (
    @mode,
    @stageId,
    @userId,
    @wins,
    @losses
  ) on conflict ("userId", "stageId", "mode") do
  update
  set
    "wins" = "wins" + @wins,
    "losses" = "losses" + @losses
`);

const addPlayerResultDeltaStm = sql.prepare(/* sql */ `
  insert into "PlayerResult" (
    "ownerUserId",
    "otherUserId",
    "mapWins",
    "mapLosses",
    "setWins",
    "setLosses",
    "type"
  ) values (
    @ownerUserId,
    @otherUserId,
    @mapWins,
    @mapLosses,
    @setWins,
    @setLosses,
    @type
  ) on conflict ("ownerUserId", "otherUserId", "type") do
  update
  set
    "mapWins" = "mapWins" + @mapWins,
    "mapLosses" = "mapLosses" + @mapLosses,
    "setWins" = "setWins" + @setWins,
    "setLosses" = "setLosses" + @setLosses
`);

const addTournamentResultStm = sql.prepare(/* sql */ `
  insert into "TournamentResult" (
    "tournamentId",
    "userId",
    "placement",
    "participantCount",
    "tournamentTeamId"
  ) values (
    @tournamentId,
    @userId,
    @placement,
    @participantCount,
    @tournamentTeamId
  )
`);

export const addSummary = sql.transaction(
  ({
    tournamentId,
    summary,
  }: {
    tournamentId: number;
    summary: TournamentSummary;
  }) => {
    for (const skill of summary.skills) {
      const insertedSkill = addSkillStm.get({
        tournamentId,
        mu: skill.mu,
        sigma: skill.sigma,
        ordinal: ordinal(skill),
        userId: skill.userId,
        identifier: skill.identifier,
        matchesCount: skill.matchesCount,
      }) as Skill;

      if (insertedSkill.identifier) {
        for (const userIdString of insertedSkill.identifier.split("-")) {
          addSkillTeamUserStm.run({
            skillId: insertedSkill.id,
            userId: Number(userIdString),
          });
        }
      }
    }

    for (const mapResultDelta of summary.mapResultDeltas) {
      addMapResultDeltaStm.run({
        mode: mapResultDelta.mode,
        stageId: mapResultDelta.stageId,
        userId: mapResultDelta.userId,
        wins: mapResultDelta.wins,
        losses: mapResultDelta.losses,
      });
    }

    for (const playerResultDelta of summary.playerResultDeltas) {
      addPlayerResultDeltaStm.run({
        ownerUserId: playerResultDelta.ownerUserId,
        otherUserId: playerResultDelta.otherUserId,
        mapWins: playerResultDelta.mapWins,
        mapLosses: playerResultDelta.mapLosses,
        setWins: playerResultDelta.setWins,
        setLosses: playerResultDelta.setLosses,
        type: playerResultDelta.type,
      });
    }

    for (const tournamentResult of summary.tournamentResults) {
      addTournamentResultStm.run({
        tournamentId,
        userId: tournamentResult.userId,
        placement: tournamentResult.placement,
        participantCount: tournamentResult.participantCount,
        tournamentTeamId: tournamentResult.tournamentTeamId,
      });
    }
  }
);
