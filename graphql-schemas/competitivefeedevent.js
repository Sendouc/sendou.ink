const { gql, UserInputError } = require("apollo-server-express")
const User = require("../mongoose-models/user")
const CompetitiveFeedEvent = require("../mongoose-models/competitivefeedevent")

const typeDef = gql`
  extend type Query {
    upcomingEvents: [CompetitiveFeedEvent!]!
  }
  extend type Mutation {
    addCompetitiveFeedEvent(
      event: CompetitiveFeedEventInput!
      lohiToken: String!
    ): Boolean!
  }
  type CompetitiveFeedEvent {
    name: String!
    date: String!
    description: String!
    poster_discord_id: String!
    poster_discord_user: User!
    message_discord_id: String!
    message_url: String!
    discord_invite_url: String!
    picture_url: String
  }

  input CompetitiveFeedEventInput {
    name: String!
    date: String!
    description: String!
    poster_discord_id: String!
    poster_username: String!
    poster_discriminator: String!
    message_discord_id: String!
    message_url: String!
    discord_invite_url: String!
    picture_url: String
  }
`
const resolvers = {
  Query: {
    upcomingEvents: () => {
      return CompetitiveFeedEvent.find({ date: { $gte: new Date() } })
        .sort({ date: "asc" })
        .populate("poster_discord_user")
    },
  },
  Mutation: {
    addCompetitiveFeedEvent: async (_root, args) => {
      if (args.lohiToken !== process.env.LOHI_TOKEN) {
        throw new UserInputError("Invalid token provided")
      }

      const user = await User.findOne({
        discord_id: args.event.poster_discord_id,
      })
      if (!user) {
        const newUser = new User({
          discord_id: args.event.poster_discord_id,
          username: args.event.poster_username,
          discriminator: args.event.poster_discriminator,
        })
        await newUser.save()
      }

      const compFeedEvent = await CompetitiveFeedEvent.findOne({
        name: args.event.name,
      })

      if (!!compFeedEvent) {
        throw new UserInputError("tournament with this name already exists")
      }

      const newCompFeedEvent = new CompetitiveFeedEvent({ ...args.event })
      await newCompFeedEvent.save()

      return true
    },
  },
}

module.exports = {
  CompetitiveFeedEvent: typeDef,
  competitiveFeedEventResolvers: resolvers,
}
