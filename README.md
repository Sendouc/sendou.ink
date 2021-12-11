Note: This is the WIP Splatoon 3 version of the site. To see the current live version checkout the [main branch](https://github.com/Sendouc/sendou.ink/tree/main)

## Running locally

Prerequisites: [Node.js 16.13](https://nodejs.org/en/)

1. Run `npm i` to install the dependencies.
2. Make a copy of `.env.example` that's called `.env` and fill it with values.

- You can check [Prisma's guide](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database) on how to get PostgreSQL set up and running locally.
- Run `npm run seed` to seed the database with some test data.

3. Run `npm run dev` to run both the server and frontend.

## File structure

```
sendou.ink/
├── app/
│   ├── components/ -- Components shared between many routes
│   ├── core/ -- Core business logic
│   ├── routes/ -- Routes see: https://remix.run/docs/en/v1/guides/routing
│   │   └── api/ -- API routes that don't belong to any one page / situations when one route has many APIs
│   ├── services/ -- Functions that handle all the interactions with the DB but also can throw HTTP errors
│   ├── styles/ -- All .css files of the project for styling
│   └── constants.ts -- Global constants of the projects
├── cypress/ -- see: https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Folder-structure
├── prisma/ -- Prisma related files
│   ├── migrations/ -- Database migrations via Prisma Migrate
│   ├── seed/ -- Seeding logic for tests and development
│   ├── client.ts -- Global import of the Prisma object
│   └── schema.prisma -- Database table schema
├── public/ -- Images, built assets etc. static files to be served as is
└── server/ -- Express.js server-side logic that is not handled in Remix e.g. auth
```

## Seeding script variations

You can give a variation as a flag to the seeding script changing what exactly is put in the database. For example `npm run seed -- -v=check-in` seeds the database with a variation where check-in is in progress.

## Commands

### Convert .png to .webp

`cwebp -q 80 image.png -o image.webp`

## TODO

### MVP

- [x] Captain can remove players from roster
- [x] Add info about architecture to README
- [ ] Move away from MyForm
- [x] Make description mandatory + overview tab
- [x] Captain can check in
- [x] Admin can check teams in / out
- [ ] Admin can drop people out (show on bracket somehow that they dropped)
- [ ] Admin can change team captain
- [ ] Admin can randomize and rerandomize maps
- [x] Admin can change seeding 
- [ ] Admin can start the tournament
- [ ] Table design to support arbitrary brackets
- [ ] Generate SE bracket from seeds
- [ ] Generate DE bracket from seeds
- [ ] Can add players to roster mid-tournament (but not remove)
- [ ] Admin can report score
- [ ] Action panel for captain during tournament
  - [ ] Before match is available shows info about what match we are waiting on
  - [ ] Shows current map/mode and opponent name
  - [ ] When reporting score select roster for both teams (if less than 4, remember previous selection)
  - [ ] Undo score reported even if it concluded the set
- [ ] Browse streams of the tournament in progress
- [ ] Footer
- [ ] Link nav links to old sendou.ink

### After MVP

- [ ] Detailed match reports from Lanista
- [ ] Stats
- [ ] Routine to calculate Trueskill
- [ ] Markdown support for tournament description
- [ ] Can make a new tournament as org admin
- [ ] Can delete team before checking in / tournament start
- [ ] Rules tab with a good default, highlight overrides
- [ ] Friend code to add that is easily editable even before tournament starts
- [ ] Admin can see how long each match has been in progress (with descriptive colors)
- [ ] Can make a team and if enough overlap shows automatically for a tournament
  - Show both names if different or just the one if it's the same
- [ ] Groups -> Many brackets
- [ ] Generate picture for sharing about team's matches and placement in the tournament
- [ ] Generate picture to share info about the top 3 etc.
- [ ] Widget for players to use on stream to show live score
- [ ] Each team has DC count, admin can mark DC's, show to opponent the team's DC counter
- [ ] League mode (LUTI etc.)
- [ ] Can indicate doesn't want to host, site resolves who should host

