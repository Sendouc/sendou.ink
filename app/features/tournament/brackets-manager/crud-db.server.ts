// this file offers database functions specifically for the crud.server.ts file

import type { DataTypes } from "brackets-manager/dist/types";
import { sql } from "~/db/sql";
import type {
  Tournament,
  TournamentGroup,
  TournamentMatch,
  TournamentRound,
  TournamentStage,
  TournamentTeam,
} from "~/db/types";

const team_getByTournamentIdStm = sql.prepare(/*sql*/ `
  select
    *
  from
    "TournamentTeam"
  where
    "TournamentTeam"."tournamentId" = @tournamentId
`);

export class Team {
  static #convertTeam(rawTeam: TournamentTeam): DataTypes["participant"] {
    return {
      id: rawTeam.id,
      name: rawTeam.name,
      tournament_id: rawTeam.tournamentId,
    };
  }

  static getByTournamentId(
    tournamentId: Tournament["id"]
  ): DataTypes["participant"][] {
    return team_getByTournamentIdStm
      .all({ tournamentId })
      .map(this.#convertTeam);
  }
}

const stage_getByIdStm = sql.prepare(/*sql*/ `
  select
    *
  from
    "TournamentStage"
  where
    "TournamentStage"."id" = @id
`);

const stage_getByTournamentIdStm = sql.prepare(/*sql*/ `
  select
    *
  from
    "TournamentStage"
  where
    "TournamentStage"."tournamentId" = @tournamentId
`);

const stage_insertStm = sql.prepare(/*sql*/ `
  insert into
    "TournamentStage"
    ("tournamentId", "number", "name", "type", "settings")
  values
    (@tournamentId, @number, @name, @type, @settings)
  returning *
`);

const stage_updateSettingsStm = sql.prepare(/*sql*/ `
  update
    "TournamentStage"
  set
    "settings" = @settings
  where
    "TournamentStage"."id" = @id
`);

export class Stage {
  id?: TournamentStage["id"];
  tournamentId: TournamentStage["tournamentId"];
  number: TournamentStage["number"];
  name: TournamentStage["name"];
  type: DataTypes["stage"]["type"];
  settings: TournamentStage["settings"];

  constructor(
    id: TournamentStage["id"] | undefined,
    tournamentId: TournamentStage["tournamentId"],
    number: TournamentStage["number"],
    name: TournamentStage["name"],
    type: DataTypes["stage"]["type"],
    settings: TournamentStage["settings"]
  ) {
    this.id = id;
    this.tournamentId = tournamentId;
    this.number = number;
    this.name = name;
    this.type = type;
    this.settings = settings;
  }

  insert() {
    const stage = stage_insertStm.get({
      tournamentId: this.tournamentId,
      number: this.number,
      name: this.name,
      type: this.type,
      settings: this.settings,
    });

    this.id = stage.id;

    return true;
  }

  static #convertStage(rawStage: TournamentStage): DataTypes["stage"] {
    return {
      id: rawStage.id,
      name: rawStage.name,
      number: rawStage.number,
      settings: JSON.parse(rawStage.settings),
      tournament_id: rawStage.tournamentId,
      type: rawStage.type,
    };
  }

  static getById(id: TournamentStage["id"]): DataTypes["stage"] {
    return this.#convertStage(stage_getByIdStm.get({ id }));
  }

  static getByTournamentId(
    tournamentId: Tournament["id"]
  ): DataTypes["participant"][] {
    return stage_getByTournamentIdStm
      .all({ tournamentId })
      .map(this.#convertStage);
  }

  static updateSettings(
    id: TournamentStage["id"],
    settings: TournamentStage["settings"]
  ) {
    stage_updateSettingsStm.run({ id, settings });

    return true;
  }
}

const group_getByStageIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentGroup"
    where "TournamentGroup"."stageId" = @stageId
`);

const group_insertStm = sql.prepare(/*sql*/ `
  insert into
    "TournamentGroup"
    ("stageId", "number")
  values
    (@stageId, @number)
  returning *
`);

export class Group {
  id?: TournamentGroup["id"];
  stageId: TournamentGroup["stageId"];
  number: TournamentGroup["number"];

  constructor(
    id: TournamentGroup["id"] | undefined,
    stageId: TournamentGroup["stageId"],
    number: TournamentGroup["number"]
  ) {
    this.id = id;
    this.stageId = stageId;
    this.number = number;
  }

  static #convertGroup(rawGroup: TournamentGroup): DataTypes["group"] {
    return {
      id: rawGroup.id,
      number: rawGroup.number,
      stage_id: rawGroup.stageId,
    };
  }

  static getByStageId(stageId: TournamentStage["id"]): DataTypes["group"][] {
    return group_getByStageIdStm.all({ stageId }).map(this.#convertGroup);
  }

  insert() {
    const group = group_insertStm.get({
      stageId: this.stageId,
      number: this.number,
    });

    this.id = group.id;

    return true;
  }
}

const round_getByStageIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentRound"
    where "TournamentRound"."stageId" = @stageId
`);

const round_insertStm = sql.prepare(/*sql*/ `
  insert into
    "TournamentRound"
    ("stageId", "groupId", "number")
  values
    (@stageId, @groupId, @number)
  returning *
`);

export class Round {
  id?: TournamentRound["id"];
  stageId: TournamentRound["stageId"];
  groupId: TournamentRound["groupId"];
  number: TournamentRound["number"];

  constructor(
    id: TournamentRound["id"] | undefined,
    stageId: TournamentRound["stageId"],
    groupId: TournamentRound["groupId"],
    number: TournamentRound["number"]
  ) {
    this.id = id;
    this.stageId = stageId;
    this.groupId = groupId;
    this.number = number;
  }

  insert() {
    const round = round_insertStm.get({
      stageId: this.stageId,
      groupId: this.groupId,
      number: this.number,
    });

    this.id = round.id;

    return true;
  }

  static #convertRound(rawRound: TournamentRound): DataTypes["round"] {
    return {
      id: rawRound.id,
      group_id: rawRound.groupId,
      number: rawRound.number,
      stage_id: rawRound.stageId,
    };
  }

  static getByStageId(stageId: TournamentStage["id"]): DataTypes["round"][] {
    return round_getByStageIdStm.all({ stageId }).map(this.#convertRound);
  }
}

const match_getByStageIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentMatch"
    where "TournamentMatch"."stageId" = @stageId
`);

const match_insertStm = sql.prepare(/*sql*/ `
  insert into
    "TournamentMatch"
    ("childCount", "roundId", "stageId", "groupId", "number", "opponentOne", "opponentTwo", "status")
  values
    (@childCount, @roundId, @stageId, @groupId, @number, @opponentOne, @opponentTwo, @status)
  returning *
`);

export class Match {
  id?: TournamentMatch["id"];
  childCount: TournamentMatch["childCount"];
  roundId: TournamentMatch["roundId"];
  stageId: TournamentMatch["stageId"];
  groupId: TournamentMatch["groupId"];
  number: TournamentMatch["number"];
  opponentOne: TournamentMatch["opponentOne"];
  opponentTwo: TournamentMatch["opponentTwo"];
  status: TournamentMatch["status"];

  constructor(
    id: TournamentMatch["id"] | undefined,
    status: TournamentMatch["status"],
    stageId: TournamentMatch["stageId"],
    groupId: TournamentMatch["groupId"],
    roundId: TournamentMatch["roundId"],
    number: TournamentMatch["number"],
    childCount: TournamentMatch["childCount"],
    _unknown1: null,
    _unknown2: null,
    _unknown3: null,
    opponentOne: TournamentMatch["opponentOne"],
    opponentTwo: TournamentMatch["opponentTwo"]
  ) {
    this.id = id;
    this.childCount = childCount;
    this.roundId = roundId;
    this.stageId = stageId;
    this.groupId = groupId;
    this.number = number;
    this.opponentOne = opponentOne;
    this.opponentTwo = opponentTwo;
    this.status = status;
  }

  static #convertMatch(rawMatch: TournamentMatch): DataTypes["match"] {
    return {
      id: rawMatch.id,
      child_count: rawMatch.childCount,
      group_id: rawMatch.groupId,
      number: rawMatch.number,
      opponent1: JSON.parse(rawMatch.opponentOne),
      opponent2: JSON.parse(rawMatch.opponentTwo),
      round_id: rawMatch.roundId,
      stage_id: rawMatch.stageId,
      status: rawMatch.status,
    };
  }

  static getByStageId(stageId: TournamentStage["id"]): DataTypes["match"][] {
    return match_getByStageIdStm.all({ stageId }).map(this.#convertMatch);
  }

  insert() {
    const match = match_insertStm.get({
      childCount: this.childCount,
      roundId: this.roundId,
      stageId: this.stageId,
      groupId: this.groupId,
      number: this.number,
      opponentOne: this.opponentOne,
      opponentTwo: this.opponentTwo,
      status: this.status,
    });

    this.id = match.id;

    return true;
  }
}
