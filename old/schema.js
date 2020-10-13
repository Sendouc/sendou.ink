//https://blog.apollographql.com/modularizing-your-graphql-schema-code-d7f71d5ed5f2

const { merge } = require("lodash");
const { makeExecutableSchema, gql } = require("apollo-server-express");
const { Build, buildResolvers } = require("./graphql-schemas/build");
const {
  Placement,
  placementResolvers,
} = require("./graphql-schemas/placement");
const { Rotation, rotationResolvers } = require("./graphql-schemas/rotation");
const { User, userResolvers } = require("./graphql-schemas/user");
const { Trend, trendResolvers } = require("./graphql-schemas/trend");
const {
  Tournament,
  tournamentResolvers,
} = require("./graphql-schemas/tournament");
const {
  DetailedTournament,
  detailedTournamentResolvers,
} = require("./graphql-schemas/detailedtournament");
const {
  CompetitiveFeedEvent,
  competitiveFeedEventResolvers,
} = require("./graphql-schemas/competitivefeedevent");
const { FAPost, faPostResolvers } = require("./graphql-schemas/fapost");
const { Plus, plusResolvers } = require("./graphql-schemas/plus");
const { General, generalResolvers } = require("./graphql-schemas/general");
/*const {
  SalmonRunRecord,
  salmonRunRecordResolvers,
} = require("./graphql-schemas/salmonRunRecord")*/
const { Maplist, maplistResolvers} = require("./graphql-schemas/maps")

const Query = gql`
  type Query {
    _empty: String
  }
`;

const Mutation = gql`
  type Mutation {
    _empty: String
  }
`;

const resolvers = {};

const schema = makeExecutableSchema({
  typeDefs: [
    Query,
    Mutation,
    Build,
    Placement,
    Rotation,
    User,
    Trend,
    Tournament,
    DetailedTournament,
    CompetitiveFeedEvent,
    FAPost,
    Plus,
    General,
    Maplist,
    //SalmonRunRecord,
  ],
  resolvers: merge(
    resolvers,
    buildResolvers,
    placementResolvers,
    rotationResolvers,
    userResolvers,
    trendResolvers,
    tournamentResolvers,
    detailedTournamentResolvers,
    competitiveFeedEventResolvers,
    faPostResolvers,
    plusResolvers,
    generalResolvers,
    maplistResolvers
    //salmonRunRecordResolvers
  ),
});

module.exports = schema;
