const { UserInputError } = require("apollo-server-express")
const DetailedTournament = require("../mongoose-models/detailedtournament")
const weapons = require("../utils/weapons")
const gear = require("../utils/gear")
const stages = require("../utils/maps")

function isNum(maybeNumber) {
  return /^\d+$/.test(maybeNumber)
}

async function validateDetailedTournamentInput(input) {
  const existingTournament = await DetailedTournament.find({ name: input.name })

  if (existingTournament) {
    throw new UserInputError("Tournament with that name already exists")
  }

  //date not validated

  if (input.top_3_team_names.length !== 3) {
    throw new UserInputError("Length of top_3_team_names was not 3")
  }

  if (input.top_3_discord_ids.length !== 3) {
    throw new UserInputError("Length of top_3_discord_ids was not 3")
  }

  input.top_3_discord_ids.forEach(discord_id_arr => {
    if (discord_id_arr.length !== 4) {
      throw new UserInputError(
        "Length of top_3_discord_ids contained an array that had invalid length"
      )
    }

    discord_id_arr.forEach(discord_id => {
      if (!isNum(discord_id))
        throw new UserInputError(`Invalid Discord ID: ${discord_id}`)
    })
  })
}

async function validateDetailedMapInput(input) {
  if (!stages.includes(input.stage)) {
    throw new UserInputError(`Invalid stage name: ${input.stage}`)
  }

  if (!["SZ", "TC", "RM", "CB", "TW"].includes(input.mode)) {
    throw new UserInputError(`Invalid mode name: ${input.mode}`)
  }

  if (input.duration < 0 || input.duration > 500) {
    throw new UserInputError(`Invalid duration: ${input.duration}`)
  }

  if (input.winners.score <= input.losers.score) {
    throw new UserInputError(
      "Losing team has greater or equal score as the winner team"
    )
  }

  input.winners.players.forEach(player => validateDetailedPlayerInput(player))
  input.losers.players.forEach(player => validateDetailedPlayerInput(player))
}

/*input DetailedPlayerInput {
  discord_id: String!
  weapon: String!
  main_abilities: [Ability!]!
  sub_abilities: [Ability]!
  kills: Int!
  assists: Int!
  deaths: Int!
  specials: Int!
  paint: Int!
  gear: [String]!
}*/

async function validateDetailedPlayerInput(input) {
  if (!isNum(input.discord_id)) {
    throw new UserInputError(`Invalid Discord ID: ${input.discord_id}`)
  }

  if (!weapons.includes(input.weapon)) {
    throw new UserInputError(`Invalid weapon: ${input.weapon}`)
  }

  if (input.main_abilities.length !== 3) {
    throw new UserInputError(
      `Invalid main abilities length: ${input.main_abilities.length}`
    )
  }

  if (input.sub_abilities.length !== 9) {
    throw new UserInputError(
      `Invalid main abilities length: ${input.sub_abilities.length}`
    )
  }

  if (input.kills < 0 || input.kills > 50) {
    throw new UserInputError(`Invalid kill count: ${input.kills}`)
  }

  if (input.assists < 0 || input.assists > 50) {
    throw new UserInputError(`Invalid assist count: ${input.assists}`)
  }

  if (input.deaths < 0 || input.deaths > 50) {
    throw new UserInputError(`Invalid death count: ${input.deaths}`)
  }

  if (input.specials < 0 || input.specials > 50) {
    throw new UserInputError(`Invalid special count: ${input.specials}`)
  }

  if (input.paint < 0 || input.paint > 5000) {
    throw new UserInputError(`Invalid paint count: ${input.paint}`)
  }

  if (input.gear.length !== 3) {
    throw new UserInputError(`Invalid gear length: ${input.gear.length}`)
  }

  input.gear.forEach(gearPiece => {
    if (!gear.includes(gearPiece)) {
      throw new UserInputError(`Invalid gear: ${gearPiece}`)
    }
  })
}

module.exports = {
  validateDetailedTournamentInput,
}
