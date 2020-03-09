const { UserInputError, gql } = require("apollo-server-express")
const Team = require("../mongoose-models/team")
const User = require("../mongoose-models/user")

const typeDef = gql`
  extend type Query {
    searchForTeam(name: String!): Team
    teams: [Team!]!
  }

  extend type Mutation {
    addTeam(name: String!): Team!
    addResult(
      date: String!
      tweet_id: String
      tournament_name: String!
      placement: Int!
    ): Boolean!
  }

  extend type User {
    team: Team
  }

  type Result {
    date: String!
    tweet_id: String
    tournament_name: String!
    placement: Int!
  }

  type Founded {
    month: Int!
    year: Int!
  }

  type Team {
    name: String!
    twitter_name: String
    challonge_name: String
    discord_url: String
    founded: Founded
    captain_discord_id: String!
    member_discord_ids: [String!]!
    member_users: [User!]!
    countries: [String!]!
    tag: String
    lf_post: String
    tournament_results: [Result!]!
  }
`
const resolvers = {
  Query: {
    teams: (root, args) => Team.find({}),
    searchForTeam: (root, { name }) => {
      const name_regex = `^${name.replace("-", " ")}$`
      return Team.findOne({
        name: { $regex: new RegExp(name_regex, "i") },
      }).populate("member_users")
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
      })
      if (existing_team)
        throw new UserInputError("Team with this name already exists")

      const team = new Team({
        name,
        captain_discord_id: user.discord_id,
        member_discord_ids: [user.discord_id],
      })
      await User.findByIdAndUpdate(user._id, { $set: { team: team._id } })
      return team.save()
    },
    addResult: async (root, args, { user }) => {
      if (!user) {
        throw new UserInputError("Must be logged in")
      }

      const team = await Team.findById(user.team)

      if (!team) throw new UserInputError("Not a team captain")

      if (team.tournament_results.length > 100) {
        throw new UserInputError("Can't have more than 100 tournament results")
      }

      if (Date.parse(args.date) === NaN) {
        throw new UserInputError("Invalid date")
      }

      if (args.tweet_id && isNaN(args.tweet_id)) {
        throw new UserInputError("Tweet ID can only contain numbers")
      }

      if (
        args.tournament_name.length < 2 ||
        args.tournament_name.length > 100
      ) {
        throw new UserInputError(
          "Tournament name has to be between 2 and 100 characters long"
        )
      }

      if (args.placement < 1 || args.placement > 500) {
        throw new UserInputError("Placement has to be between 1 and 500")
      }

      team.tournament_results.push({
        date: args.date,
        tournament_name: args.tournament_name,
        placement: args.placement,
        tweet_id: args.tweet_id,
      })
      await team.save()
      return true
    },
  },
}

module.exports = {
  Team: typeDef,
  teamResolvers: resolvers,
}
