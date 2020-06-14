const { UserInputError, gql } = require("apollo-server-express")
const { v4: uuidv4 } = require("uuid")
const Team = require("../mongoose-models/team")
const User = require("../mongoose-models/user")
const Placement = require("../mongoose-models/placement")
const Player = require("../mongoose-models/player")

const typeDef = gql`
  extend type Query {
    searchForTeam(name: String!): Team
    teams: [Team!]!
  }

  extend type Mutation {
    addTeam(name: String!): Boolean!
  }

  extend type User {
    team: Team
  }

  type Founded {
    month: Int!
    year: Int!
  }

  type Member {
    discordId: String!
    captain: Boolean
    role: String
  }

  type TeamMemberPlacement {
    discordId: String!
    mode: Int!
    weapon: String!
    month: Int!
    year: Int!
    xPower: Float!
  }

  type Team {
    name: String!
    disbanded: Boolean
    founded: Founded
    members: [Member!]
    pastMembersDiscordIds: [String]
    tag: String
    # inviteCode: String
    lfPost: String
    xpPlacements: [TeamMemberPlacement!]
    teamXp: Float
  }
`

const getUsersBestPlacement = async (twitter, discordId) => {
  if (!twitter) return null

  const player = await Player.findOne({ twitter })
  if (!player) return null

  const placements = await Placement.find({ unique_id: player.unique_id })
  if (!placements.length) return null

  const best = placements.reduce((best, placement) => {
    if (placement.x_power > best.x_power) return placement

    return best
  })

  return {
    discordId,
    mode: best.mode,
    weapon: best.weapon,
    month: best.month,
    year: best.year,
    xPower: best.x_power,
  }
}

const resolvers = {
  Query: {
    teams: () => Team.find({}),
    searchForTeam: (_root, args) => {
      const name_regex = `^${args.name.replace("-", " ")}$`
      return Team.findOne({
        name: { $regex: new RegExp(name_regex, "i") },
      }).populate("memberUsers")
    },
  },
  Mutation: {
    addTeam: async (root, args, { user }) => {
      if (!user) throw new UserInputError("Must be logged in to create a team")
      if (user.team)
        throw new UserInputError(
          "Can't create a team since you are already in one"
        )

      const name = args.name.replace(/\s\s+/g, " ").trim()

      if (name.length < 2 || name.length > 32 || !/^[a-z0-9 ]+$/i.test(name)) {
        throw new UserInputError("Invalid team name provided", {
          invalidArgs: args,
        })
      }

      const name_regex = `^${name}$`
      const existing_team = await Team.findOne({
        name: { $regex: new RegExp(name_regex, "i") },
        disbanded: { $ne: true },
      })
      if (existing_team) {
        throw new UserInputError("Team with this name already exists")
      }

      const bestPlacement = await getUsersBestPlacement(
        user.twitter_name,
        user.discord_id
      )
      const teamXp = bestPlacement
        ? (bestPlacement.xPower + 2000 * 3) / 4
        : undefined
      const xpPlacements = bestPlacement ? [bestPlacement] : undefined

      const team = new Team({
        name,
        members: [
          {
            discordId: user.discord_id,
            captain: true,
          },
        ],
        inviteCode: uuidv4(),
        teamXp,
        xpPlacements,
      })

      await User.findByIdAndUpdate(user._id, { $set: { team: team._id } })
      await team.save()

      return true
    },
  },
}

module.exports = {
  Team: typeDef,
  teamResolvers: resolvers,
}
