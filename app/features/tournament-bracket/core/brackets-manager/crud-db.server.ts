// this file offers database functions specifically for the crud.server.ts file

import type {
  Participant,
  Stage as StageType,
  Group as GroupType,
  Round as RoundType,
  Match as MatchType,
} from "brackets-model";
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
  static #convertTeam(rawTeam: TournamentTeam): Participant {
    return {
      id: rawTeam.id,
      name: rawTeam.name,
      tournament_id: rawTeam.tournamentId,
    };
  }

  static getByTournamentId(tournamentId: Tournament["id"]): Participant[] {
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
  type: StageType["type"];
  settings: TournamentStage["settings"];

  constructor(
    id: TournamentStage["id"] | undefined,
    tournamentId: TournamentStage["tournamentId"],
    number: TournamentStage["number"],
    name: TournamentStage["name"],
    type: StageType["type"],
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

  static #convertStage(rawStage: TournamentStage): StageType {
    return {
      id: rawStage.id,
      name: rawStage.name,
      number: rawStage.number,
      settings: JSON.parse(rawStage.settings),
      tournament_id: rawStage.tournamentId,
      type: rawStage.type,
    };
  }

  static getById(id: TournamentStage["id"]): StageType {
    const stage = stage_getByIdStm.get({ id });
    if (!stage) return stage;
    return this.#convertStage(stage);
  }

  static getByTournamentId(tournamentId: Tournament["id"]): Participant[] {
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

const group_getByIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentGroup"
    where "TournamentGroup"."id" = @id
`);

const group_getByStageIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentGroup"
    where "TournamentGroup"."stageId" = @stageId
`);

const group_getByStageAndNumberStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentGroup"
    where "TournamentGroup"."stageId" = @stageId
      and "TournamentGroup"."number" = @number
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

  static #convertGroup(rawGroup: TournamentGroup): GroupType {
    return {
      id: rawGroup.id,
      number: rawGroup.number,
      stage_id: rawGroup.stageId,
    };
  }

  static getById(id: TournamentGroup["id"]): GroupType {
    const group = group_getByIdStm.get({ id });
    if (!group) return group;
    return this.#convertGroup(group);
  }

  static getByStageId(stageId: TournamentStage["id"]): GroupType[] {
    return group_getByStageIdStm.all({ stageId }).map(this.#convertGroup);
  }

  static getByStageAndNumber(
    stageId: TournamentStage["id"],
    number: TournamentGroup["number"]
  ): GroupType {
    const group = group_getByStageAndNumberStm.get({ stageId, number });
    if (!group) return group;
    return this.#convertGroup(group_getByStageAndNumberStm.get(group));
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

const round_getByIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentRound"
    where "TournamentRound"."id" = @id
`);

const round_getByGroupIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentRound"
    where "TournamentRound"."groupId" = @groupId
`);

const round_getByStageIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentRound"
    where "TournamentRound"."stageId" = @stageId
`);

const round_getByGroupAndNumberStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentRound"
    where "TournamentRound"."groupId" = @groupId
      and "TournamentRound"."number" = @number
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

  static #convertRound(rawRound: TournamentRound): RoundType {
    return {
      id: rawRound.id,
      group_id: rawRound.groupId,
      number: rawRound.number,
      stage_id: rawRound.stageId,
    };
  }

  static getByStageId(stageId: TournamentStage["id"]): RoundType[] {
    return round_getByStageIdStm.all({ stageId }).map(this.#convertRound);
  }

  static getByGroupId(groupId: TournamentGroup["id"]): RoundType[] {
    return round_getByGroupIdStm.all({ groupId }).map(this.#convertRound);
  }

  static getByGroupAndNumber(
    groupId: TournamentGroup["id"],
    number: TournamentRound["number"]
  ): RoundType {
    const round = round_getByGroupAndNumberStm.get({ groupId, number });
    if (!round) return round;
    return this.#convertRound(round);
  }

  static getById(id: TournamentRound["id"]): RoundType {
    const round = round_getByIdStm.get({ id });
    if (!round) return round;
    return this.#convertRound(round);
  }
}

const match_getByIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentMatch"
    where "TournamentMatch"."id" = @id
`);

const match_getByStageIdStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentMatch"
    where "TournamentMatch"."stageId" = @stageId
`);

const match_getByRoundAndNumberStm = sql.prepare(/*sql*/ `
  select *
    from "TournamentMatch"
    where "TournamentMatch"."roundId" = @roundId
      and "TournamentMatch"."number" = @number
`);

const match_insertStm = sql.prepare(/*sql*/ `
  insert into
    "TournamentMatch"
    ("childCount", "roundId", "stageId", "groupId", "number", "opponentOne", "opponentTwo", "status")
  values
    (@childCount, @roundId, @stageId, @groupId, @number, @opponentOne, @opponentTwo, @status)
  returning *
`);

const match_updateStm = sql.prepare(/*sql*/ `
  update "TournamentMatch"
    set
      "childCount" = @childCount,
      "roundId" = @roundId,
      "stageId" = @stageId,
      "groupId" = @groupId,
      "number" = @number,
      "opponentOne" = @opponentOne,
      "opponentTwo" = @opponentTwo,
      "status" = @status
    where
      "TournamentMatch"."id" = @id
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

  static #convertMatch(rawMatch: TournamentMatch): MatchType {
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

  static getById(id: TournamentMatch["id"]): MatchType {
    const match = match_getByIdStm.get({ id });
    if (!match) return match;
    return this.#convertMatch(match);
  }

  static getByStageId(stageId: TournamentStage["id"]): MatchType[] {
    return match_getByStageIdStm.all({ stageId }).map(this.#convertMatch);
  }

  static getByRoundAndNumber(
    roundId: TournamentRound["id"],
    number: TournamentMatch["number"]
  ): MatchType {
    const match = match_getByRoundAndNumberStm.get({ roundId, number });
    if (!match) return match;
    return this.#convertMatch(match);
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

  update() {
    match_updateStm.run({
      id: this.id,
      childCount: this.childCount,
      roundId: this.roundId,
      stageId: this.stageId,
      groupId: this.groupId,
      number: this.number,
      opponentOne: this.opponentOne,
      opponentTwo: this.opponentTwo,
      status: this.status,
    });

    return true;
  }
}
