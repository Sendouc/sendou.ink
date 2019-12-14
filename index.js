require("dotenv").config()
const { ApolloServer } = require("apollo-server-express")
const mongoose = require("mongoose")
const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const cors = require("cors")
const passport = require("passport")
const DiscordStrategy = require("passport-discord").Strategy
const User = require("./models/user")
const path = require("path")
const schema = require("./schema")

mongoose.set("useFindAndModify", false)
mongoose.set("useCreateIndex", true)

const callbackURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001/auth/discord/callback"
    : "https://sendou.ink/auth/discord/callback"

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL,
      scope: ["identify", "connections"],
    },
    function(accessToken, refreshToken, profile, cb) {
      const userToSave = {
        username: profile.username,
        discriminator: profile.discriminator,
        discord_id: profile.id,
      }
      for (var i = 0; i < profile.connections.length; i++) {
        const connection = profile.connections[i]
        if (connection.visibility === 1 && connection.verified) {
          if (connection.type === "twitch") {
            userToSave.twitch_name = connection.name.toLowerCase()
          } else if (connection.type === "twitter") {
            userToSave.twitter_name = connection.name.toLowerCase()
          }
        }
      }

      User.updateOne(
        { discord_id: userToSave.discord_id },
        userToSave,
        { upsert: true },
        function(err, user) {
          return cb(err, userToSave)
        }
      )
    }
  )
)

passport.serializeUser(function(user, done) {
  done(null, user.discord_id)
})

passport.deserializeUser(function(discord_id, done) {
  User.findOne({ discord_id }, function(err, user) {
    done(err, user)
  })
})

console.log("connecting to MongoDB")

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    dbName: "production",
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to MongoDB")
  })
  .catch(error => {
    console.log("error connection to MongoDB:", error.message)
  })

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    if (process.env.NODE_ENV === "development") {
      return {
        user: {
          _id: "5cee8f73d1120d4315c55011",
          discord_id: "79237403620945920",
          __v: 0,
          avatar: "2e292c1b5d1366c24a9e4b6c1cffc700",
          discriminator: "0043",
          twitch_name: "sendou",
          twitter_name: "sendouc",
          username: "Sendou",
          weapons: [
            "Tenta Brella",
            "Range Blaster",
            "Kensa Sloshing Machine",
            "Custom Blaster",
          ],
          country: "fi",
          top500: true,
        },
      }
    }
    return { user: req.user }
  },
})

const app = express()

app.use(cors())

//https://stackoverflow.com/questions/8605720/how-to-force-ssl-https-in-express-js/31144924#31144924

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (
    !req.secure &&
    req.get("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV !== "development"
  ) {
    return res.redirect("https://" + req.get("host") + req.url)
  }
  next()
}

app.use(requireHTTPS)

//https://www.npmjs.com/package/express-session

let sess = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1209600000 }, // 2 weeks
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    touchAfter: 24 * 3600,
  }),
}

if (process.env.NODE_ENV === "production") {
  sess.cookie.secure = true
  app.set("trust proxy", 1)
}

app.use(session(sess))

app.use(express.static("build"))

app.use(passport.initialize())
app.use(passport.session())

server.applyMiddleware({ app })

app.get("/auth/discord", passport.authenticate("discord"))

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/404",
  }),
  function(req, res) {
    res.redirect("/u/" + req.user.discord_id) // Successful auth
  }
)

app.get("/logout", function(req, res) {
  req.logout()
  res.redirect("/")
})

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"))
})

const PORT = process.env.PORT || 3001
app.listen({ port: PORT }, () => {
  console.log(`Server running on http://localhost:${PORT}${server.graphqlPath}`)
})
