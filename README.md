[![Discord Server](https://discordapp.com/api/guilds/299182152161951744/embed.png)](https://discord.gg/sendou)

Goal of sendou.ink is to provide useful tools and resources for the Splatoon community.

Live version: [https://sendou.ink/](https://sendou.ink/)

> :warning: **This is the overhaul branch**: Live version is still on the old version

## Technologies used

- React (via Next.JS)
- TypeScript
- Node.js
- PostgreSQL (via Prisma 2)

## A few highlight features

🦑 Planner tool where you can draw on any map in the game to conveniently make up game plans

🦑 Calendar that collects together all the events happening in the community

🦑 Users can make an account and submit their builds and browse builds made by others

🦑 It is possible to submit yourself as "free agent". If two FA's like each other they are notified and a new team can be founded

🦑 X Rank Top 500 results can be browsed through far more conveniently than on the official app

🦑 X Rank Top 500 leaderboards to compare yourself against other players

🦑 Browse through detailed tournament results

🦑 Choose between light and dark mode

## Setting up the project locally

### Access pages that don't need database access

With the following steps you can access a few pages that don't need a database: home page (`/`), build analyzer (`/analyzer`) and map planner (`/plans`)

1. Clone the project
2. Run `npm i` to install dependencies
3. Run `npm run compile` to compile translation files.
4. Run `npm run dev` to start the developmen server at http://localhost:3000/

### Access rest of the pages

In addition to the steps above the steps below enable access to rest of the pages.

5. Create a file called `.env` in the `prisma` folder. In it you need an environmental variable called `DATABASE_URL` that contains the URL to a running PostgreSQL database. For example mine looks like this while developing:

```
DATABASE_URL=postgresql://sendou@localhost:5432
```

_You can see [Prisma's guide on how to set up a PostgreSQL database running locally](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database) for more info._

6. Once you have a database running run `psql -d postgres < dump.sql` in the `prisma` folder (assuming your database name is `postgres`). This formats the database with the correct tables and fills it with real data dumped from the production site.

### Enable logging in

In addition to the steps above the steps below enable logging in.

7. Create a file called `.env.local` in the root folder. In it you need following variables:

```
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
JWT_SECRET=
```

a) Go to https://discord.com/developers/applications
b) Select "New Application"
c) Go to your newly generated application
d) On the "General Information" tab both "CLIEN ID" and "CLIENT SECRET" can be found.
e) On the "OAuth2" tab add `http://localhost:3000/api/auth/callback/discord` in the list of redirects.

`JWT_SECRET` can be any randomly generated reasonably long string.

## Contributing

Check out the [list of existing issues I haven't assigned for myself](https://github.com/Sendouc/sendou.ink/issues?q=is%3Aopen+is%3Aissue+no%3Aassignee) to find issues I could accept help with. Before you start working on one please leave a comment.

Is there a bug or a new feature that isn't an issue yet? Feel free to leave one.

Please always leave a comment or create an issue before working on anything.
