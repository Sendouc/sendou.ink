require("dotenv").config()

module.exports = {
  client: "pg",
  connection: process.env.POSTGRESQL_URI,
  ssl: true,
}
