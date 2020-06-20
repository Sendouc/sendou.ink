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
    joinTeam(inviteCode: String!): Boolean!
    resetInviteCode: String!
    leaveTeam: Boolean!
    disbandTeam: Boolean!
    # transferCaptain: Boolean!
    # updateTeam(newValues: UpdateTeamInput!): Boolean!
  }

  extend type User {
    team: ID
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
    countries: [String!]
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

const recalculateTeamsXp = async (team, discordIdToSkip) => {
  const teamsPlacements = []

  for (const member of team.members) {
    if (member.discordId === discordIdToSkip) {
      continue
    }
    const user = await User.findOne({ discord_id: member.discordId })
    const bestPlacement = await getUsersBestPlacement(
      user.twitter_name,
      user.discord_id
    )
    if (bestPlacement) teamsPlacements.push(bestPlacement)
  }

  const xpPlacements = teamsPlacements
    .sort((a, b) => b.xPower - a.xPower)
    .slice(0, 4)
  team.xpPlacements = xpPlacements

  let teamXp = xpPlacements.reduce((acc, cur) => (acc += cur.xPower), 0)

  teamXp += 2000 * (4 - xpPlacements.length)
  teamXp /= 4

  team.teamXp = teamXp
}

const recalculateTeamsCountries = async (team, newCountry, discordIdToSkip) => {
  const newCountries = new Set()
  if (newCountry) newCountries.add(newCountry)
  for (const member of team.members) {
    if (member.discordId === discordIdToSkip) {
      continue
    }
    const user = await User.findOne({ discord_id: member.discordId })
    if (user.country) newCountries.add(user.country)
  }

  team.countries = Array.from(newCountries)
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

      const countries = user.country ? [user.country] : undefined

      const team = new Team({
        name,
        members: [
          {
            discordId: user.discord_id,
            captain: true,
          },
        ],
        countries,
        inviteCode: uuidv4(),
        teamXp,
        xpPlacements,
      })

      await User.findByIdAndUpdate(user._id, { $set: { team: team._id } })
      await team.save()

      return true
    },
    joinTeam: async (root, { inviteCode }, { user }) => {
      if (!user) throw new UserInputError("Must be logged in to join a team")
      if (user.team) {
        throw new UserInputError(
          "Can't join a team since you are already in one"
        )
      }

      const team = await Team.findOne({ inviteCode })
      if (!team) {
        throw new UserInputError("Invalid invite code provided")
      }

      if (team.members.length >= 12) {
        throw new UserInputError(
          "This team already has the max number of members"
        )
      }

      team.members.push({
        discordId: user.discord_id,
      })

      const bestPlacement = await getUsersBestPlacement(
        user.twitter_name,
        user.discord_id
      )

      if (bestPlacement) {
        const teamsPlacements = team.xpPlacements || []
        teamsPlacements.push(bestPlacement)
        teamsPlacements.sort((a, b) => b.xPower - a.xPower)

        if (teamsPlacements.length === 5) teamsPlacements.pop()

        team.xpPlacements = teamsPlacements

        let teamXp = teamsPlacements.reduce(
          (acc, cur) => (acc += cur.xPower),
          0
        )

        teamXp += 2000 * (4 - teamsPlacements.length)
        teamXp /= 4

        team.teamXp = teamXp
      }

      if (user.country) {
        const countries = team.countries || []
        if (!countries.includes(user.country)) countries.push(user.country)

        team.countries = countries
      }

      await team.save()
      await User.findByIdAndUpdate(ctx.user._id, { $set: { team: team._id } })

      return true
    },
    resetInviteCode: async (_root, _args, { user }) => {
      if (!user)
        throw new UserInputError("Must be logged in to reset invite code")
      if (!user.team) {
        throw new UserInputError("Must have team to reset invite code")
      }

      const team = await Team.findById(user.team)
      if (!team) {
        throw new Error("Unexpected error: team not found with the id")
      }

      const newCode = uuidv4()
      team.inviteCode = newCode
      await team.save()

      return newCode
    },
    leaveTeam: async (_root, _args, { user }) => {
      if (!user) throw new UserInputError("Must be logged in to leave a team")
      if (!user.team) {
        throw new UserInputError("Can't leave a team if you aren't in one")
      }

      const team = await Team.findById(user.team)
      if (!team) {
        throw new Error("Unexpected error: team not found with the id")
      }
      const memberOfTeam = team.members.find(
        (member) => member.discordId === user.discord_id
      )
      if (!memberOfTeam) {
        throw new Error("Unexpected error: user not found in the member list")
      }

      if (memberOfTeam.captain) {
        throw new UserInputError("Can't leave a team you are captain for")
      }

      team.members = team.members.filter(
        (member) => member.discordId !== user.discord_id
      )

      await User.findByIdAndUpdate(user._id, { $unset: { team: "" } })
      const pastMembers = team.pastMembersDiscordIds
        ? team.pastMembersDiscordIds
        : []
      if (!pastMembers.includes(user.discord_id))
        pastMembers.push(user.discord_id)
      team.pastMembersDiscordIds = pastMembers

      await Promise.all([
        recalculateTeamsCountries(team, null, user.discord_id),
        recalculateTeamsXp(team, user.discord_id),
      ])

      await team.save()

      return true
    },
    disbandTeam: async (_root, _args, { user }) => {
      if (!user)
        throw new UserInputError("Must be logged in to reset invite code")
      if (!user.team) {
        throw new UserInputError("Must have team to reset invite code")
      }

      const team = await Team.findById(user.team)
      if (!team) {
        throw new Error("Unexpected error: team not found with the id")
      }

      const memberOfTeam = team.members.find(
        (member) => member.discordId === user.discord_id
      )
      if (!memberOfTeam) {
        throw new Error("Unexpected error: user not found in the member list")
      }

      if (!memberOfTeam.captain) {
        throw new UserInputError(
          "Can't disband a team you are not a captain for"
        )
      }

      team.disbanded = true

      await Promise.all(
        team.members
          .map((member) =>
            User.findOneAndUpdate(
              { discord_id: member.discordId },
              { $unset: { team: "" } }
            )
          )
          .concat(team.save())
      )

      return true
    },
  },
}

module.exports = {
  Team: typeDef,
  teamResolvers: resolvers,
  recalculateTeamsCountries,
}
