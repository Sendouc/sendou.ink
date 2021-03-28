[![Discord Server](https://discordapp.com/api/guilds/299182152161951744/embed.png)](https://discord.gg/sendou)

Goal of sendou.ink is to provide useful tools and resources for the Splatoon community.

Live version: [https://sendou.ink/](https://sendou.ink/)

## Technologies used

- React (via Next.JS)
- TypeScript
- Node.js
- PostgreSQL (via Prisma 2)

## A few of the features

🐙 Choose between light and dark mode

🦑 Planner tool where you can draw on any map in the game to conveniently make up game plans

🐙 Calendar that collects together all the events happening in the community

🦑 Users can make an account and submit their builds and browse builds made by others

🐙 It is possible to submit yourself as "free agent". If two FA's like each other they are notified and a new team can be founded

🦑 X Rank Top 500 results can be browsed through far more conveniently than on the official app

🐙 X Rank Top 500 leaderboards to compare yourself against other players

🦑 Form your own team, recruit players and make a profile

🐙 Build analyzer that reveals way more detailed information about builds than the game does

🦑 Salmon Run leaderboards featuring some of the best records

🐙 The most comprehensive link collection in the community

## Setting up the project locally

### Access pages that don't need database access

With the following steps you can access a few pages that don't need a database. For example: home page (`/`), build analyzer (`/analyzer`) and map planner (`/plans`)

1. Clone the project
2. Run `npm i` to install dependencies
3. Run `npm run compile` to compile translation files.
4. Run `npm run dev` to start the development server at http://localhost:3000/

If you do not intend to perform any additional setup steps, you will also need to create an empty list of patrons in `utils/data/patrons.json`:

```
[]
```

### Access rest of the pages

In addition to the steps above the steps below enable access to rest of the pages.

5. Create a file called `.env` in the `prisma` folder. In it you need an environmental variable called `DATABASE_URL` that contains the URL to a running PostgreSQL database. For example mine looks like this while developing:

```
DATABASE_URL=postgresql://sendou@localhost:5432
```

_You can see [Prisma's guide on how to set up a PostgreSQL database running locally](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database) for more info._

6. Use `npm run migrate` to get the database formatted with the right tables.
7. Run `npm run prebuild` to generate a few necessary JSON configuration files.
8. There should be a seeding script but this doesn't exist yet. If anyone is interested in contributing this is probably a good starting point (see issue #197).

### Enable logging in

In addition to the steps above the steps below enable logging in.

9. Create a file called `.env.local` in the root folder. In it you need following variables:

```
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
JWT_SECRET=
```

a) Go to https://discord.com/developers/applications  
b) Select "New Application"  
c) Go to your newly generated application  
d) On the "General Information" tab both "CLIENT ID" and "CLIENT SECRET" can be found.  
e) On the "OAuth2" tab add `http://localhost:3000/api/auth/callback/discord` in the list of redirects.

`JWT_SECRET` can be any randomly generated reasonably long string.

## Using API

If you wish to use the sendou.ink API for your own project like a Discord bot you can use the API endpoints under `https://sendou.ink/api/bot` (https://github.com/Sendouc/sendou.ink/tree/main/pages/api/bot) as long as you keep the load on my backend reasonable.

Using other endpoints isn't advised as I change those as I feel to suit the needs of the website. If the endpoints under `/bot` don't meet your use case feel free to leave an issue.

## Contributing

If you are interested in contributing come say hello on Discord! For any feature requests or bug reports you can either leave an issue or use the #feedback channel on Discord.
