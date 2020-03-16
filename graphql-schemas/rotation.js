const { gql } = require("apollo-server-express")
const axios = require("axios")

const typeDef = gql`
  extend type Query {
    rotationData: String
  }
`

let rotationData = { timestamp: 0 } //will probably not work

const resolvers = {
  Query: {
    rotationData: async (root, args) => {
      if (Math.floor(Date.now() / 1000) - rotationData.timestamp > 7200) {
        //only refetching data if two hours have passed
        const result = await axios.get(
          "https://splatoon2.ink/data/schedules.json",
          {
            headers: {
              "User-Agent": "sendou.ink - owner: @Sendouc on Twitter",
            },
          }
        )
        rotationData = result.data
        rotationData.timestamp = Math.floor(Date.now() / 1000)
        return JSON.stringify(rotationData)
      } else {
        return JSON.stringify(rotationData)
      }
    },
  },
}

module.exports = {
  Rotation: typeDef,
  rotationResolvers: resolvers,
}
