const { UserInputError, gql } = require("apollo-server-express")
const Team = require("../mongoose-models/team")
const User = require("../mongoose-models/user")

const typeDef = gql`
  extend type Query {
    teams: [Team!]!
  }

  extend type Mutation {
    createTeam(name: String!): Team!
  }

  extend type User {
    team: Team
  }

  type Result {
    date: String
    tweet_url: String
    tournament_name: String!
    placement: Int!
  }

  type Team {
    name: String!
    twitter_name: String
    captain_discord_id: String!
    member_discord_ids: [String!]!
    member_users: [User!]!
    countries: [String!]!
    tag: String
    invite_code: String
    lf_post: String
    tournament_results: [Result!]!
  }
`
const resolvers = {
  Query: {
    teams: (root, args) => Team.find({}),
  },
  Mutation: {
    createTeam: async (root, args, { user }) => {
      if (!user) throw new UserInputError("Must be logged in to create a team")
      if (user.team)
        throw new UserInputError(
          "Can't create a team since you are already in one"
        )

      const name = args.name.replace(/\s\s+/g, " ").trim()

      if (name.length < 2 || name.length > 32 || !/^[a-z0-9␣]+$/i.test(name)) {
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

      const team = new Team({ name, captain_discord_id: user.discord_id })
      await User.findByIdAndUpdate(user._id, { $set: { team: team._id } })
      return team.save()
    },
  },
}

module.exports = {
  Team: typeDef,
  teamResolvers: resolvers,
}
