const { UserInputError } = require("apollo-server-express")
const DetailedTournament = require("../mongoose-models/detailedtournament")

function isNum(maybeNumber) {
  return /^\d+$/.test(maybeNumber)
}

/*name: String!
    bracket_url: String!
    date: String!
    top_3_team_names: [String!]!
    top_3_discord_ids: [[String!]!]!*/

async function validateDetailedTournamentInput(input) {
  const existingTournament = await DetailedTournament.find({ name: input.name })

  if (existingTournament) {
    throw new UserInputError("Tournament with that name already exists")
  }

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
