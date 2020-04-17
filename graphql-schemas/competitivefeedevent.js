const { gql, UserInputError } = require("apollo-server-express")
const User = require("../mongoose-models/user")
const CompetitiveFeedEvent = require("../mongoose-models/competitivefeedevent")

const typeDef = gql`
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
  Mutation: {
    addCompetitiveFeedEvent: async (root, args, ctx) => {
      console.log("args", args)
      if (args.lohiToken !== process.env.LOHI_TOKEN) {
        throw new UserInputError("Invalid token provided")
      }
      console.log("jaa")

      const user = await User.find({ discord_id: args.poster_discord_id })
      if (!user) {
        const newUser = new User({
          discord_id: ctx.poster_discord_id,
          username: args.poster_username,
          discriminator: args.poster_discriminator,
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
