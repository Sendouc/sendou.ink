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
    updateCompetitiveFeedEvent(
      event: UpdateCompetitiveFeedEventInput!
    ): Boolean!
    deleteCompetitiveFeedEvent(message_discord_id: String!): Boolean!
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

  input UpdateCompetitiveFeedEventInput {
    name: String!
    date: String!
    description: String!
    message_discord_id: String!
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
    updateCompetitiveFeedEvent: async (_root, { event }, ctx) => {
      if (!ctx.user) throw new AuthenticationError("not logged in")

      const existingEvent = await CompetitiveFeedEvent.findOne({
        message_discord_id: event.message_discord_id,
      })
      if (!existingEvent)
        throw new UserInputError("no event matching message_discord_id")

      if (existingEvent.poster_discord_id !== ctx.user.discord_id) {
        throw new AuthenticationError("no permissions to edit the event")
      }

      if (event.name !== existingEvent.name) {
        const eventWithName = await CompetitiveFeedEvent.findOne({
          name: event.name,
        })
        if (eventWithName) {
          throw new UserInputError("tournament with this name already exists")
        }
      }

      const dateNow = new Date()
      const newDate = new Date(event.date)

      if (!newDate) {
        throw new UserInputError("invalid new date")
      }

      if (newDate.getTime() < dateNow.getTime()) {
        throw new UserInputError("new date in the past")
      }

      await CompetitiveFeedEvent.updateOne(
        { message_discord_id: event.message_discord_id },
        { $set: { ...event } }
      )

      return true
    },
    deleteCompetitiveFeedEvent: async (_root, { message_discord_id }, ctx) => {
      if (!ctx.user) throw new AuthenticationError("not logged in")

      const event = await CompetitiveFeedEvent.findOne({
        message_discord_id,
      })

      if (!event) throw new UserInputError("no event matching the id")

      if (event.poster_discord_id !== ctx.user.discord_id)
        throw new AuthenticationError("no permissions to remove the post")

      await CompetitiveFeedEvent.deleteOne({ message_discord_id })
      return true
    },
  },
}

module.exports = {
  CompetitiveFeedEvent: typeDef,
  competitiveFeedEventResolvers: resolvers,
}
