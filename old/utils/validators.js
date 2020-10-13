const DetailedTournament = require("../mongoose-models/detailedtournament");
const weapons = require("../utils/weapons");
const gear = require("../utils/gear");
const stages = require("../utils/maps");

function isNum(maybeNumber) {
  return /^\d+$/.test(maybeNumber);
}

async function validateDetailedTournamentInput(input) {
  const problems = [];
  const existingTournament = await DetailedTournament.findOne({
    name: input.name,
  });

  if (existingTournament) {
    problems.push("Tournament with that name already exists");
  }

  //date not validated

  if (input.top_3_team_names.length !== 3) {
    problems.push("Length of top_3_team_names was not 3");
  }

  if (input.top_3_discord_ids.length !== 3) {
    problems.push("Length of top_3_discord_ids was not 3");
  }

  input.top_3_discord_ids.forEach((discord_id_arr) => {
    if (discord_id_arr.length !== 4) {
      problems.push(
        "Length of top_3_discord_ids contained an array that had invalid length"
      );
    }

    discord_id_arr.forEach((discord_id) => {
      if (!isNum(discord_id))
        problems.push(`Invalid Discord ID: ${discord_id}`);
    });
  });

  return problems;
}

function validateDetailedMapInput(input) {
  const problems = [];
  if (!stages.includes(input.stage)) {
    problems.push(`Invalid stage name: ${input.stage}`);
  }

  if (!["SZ", "TC", "RM", "CB", "TW"].includes(input.mode)) {
    problems.push(`Invalid mode name: ${input.mode}`);
  }

  if (input.duration < 0 || input.duration > 500) {
    problems.push(`Invalid duration: ${input.duration}`);
  }

  if (input.winners.score <= input.losers.score) {
    problems.push("Losing team has greater or equal score as the winner team");
  }

  input.winners.players.forEach((player) =>
    validateDetailedPlayerInput(player, problems)
  );
  input.losers.players.forEach((player) =>
    validateDetailedPlayerInput(player, problems)
  );

  return problems;
}

function validateDetailedPlayerInput(input, problems) {
  if (input.discord_id && !isNum(input.discord_id)) {
    problems.push(`Invalid Discord ID: ${input.discord_id}`);
  }

  if (!weapons.includes(input.weapon)) {
    problems.push(`Invalid weapon: ${input.weapon}`);
  }

  if (input.main_abilities.length !== 3) {
    problems.push(
      `Invalid main abilities length: ${input.main_abilities.length}`
    );
  }

  if (input.sub_abilities.flat().length !== 9) {
    problems.push(
      `Invalid sub abilities length: ${input.sub_abilities.flat().length}`
    );
  }

  if (input.kills < 0 || input.kills > 50) {
    problems.push(`Invalid kill count: ${input.kills}`);
  }

  if (input.assists < 0 || input.assists > 50) {
    problems.push(`Invalid assist count: ${input.assists}`);
  }

  if (input.deaths < 0 || input.deaths > 50) {
    problems.push(`Invalid death count: ${input.deaths}`);
  }

  if (input.specials < 0 || input.specials > 50) {
    problems.push(`Invalid special count: ${input.specials}`);
  }

  if (input.paint < 0 || input.paint > 5000) {
    problems.push(`Invalid paint count: ${input.paint}`);
  }

  if (input.gear) {
    if (input.gear.length !== 3)
      problems.push(`Invalid gear length: ${input.gear.length}`);

    input.gear.forEach((gearPiece) => {
      if (!gear.includes(gearPiece)) {
        problems.push(`Invalid gear: ${gearPiece}`);
      }
    });
  }

  return problems;
}

module.exports = {
  validateDetailedTournamentInput,
  validateDetailedMapInput,
};
