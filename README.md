Note: This is the WIP Splatoon 3 version of the site. To see the current live version checkout the [main branch](https://github.com/Sendouc/sendou.ink/tree/main)

## Running locally

Prerequisites: [Node.js 16.13](https://nodejs.org/en/)

1. Run `npm i` to install the dependencies.
2. Make a copy of `.env.example` that's called `.env` and fill it with values.

- You can check [Prisma's guide](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database) on how to get PostgreSQL set up and running locally.
- Run `npm run migration:apply:dev` to set up the tables of your database.
- Run `npm run seed` to seed the database with some test data.

3. Run `npm run dev` to run both the server and frontend.

## File structure

```
sendou.ink/
├── app/
│   ├── components/ -- Components shared between many routes
│   ├── core/ -- Core business logic
│   ├── hooks/ -- React hooks
│   ├── models/ -- Calls to database
│   ├── routes/ -- Routes see: https://remix.run/docs/en/v1/guides/routing
│   ├── services/ -- Functions that loaders etc. call that typically work with multiple models
│   ├── styles/ -- All .css files of the project for styling
│   ├── utils/ -- Random helper functions used in many places
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
