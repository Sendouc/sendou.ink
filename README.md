Note: This is the WIP Splatoon 3 version of the site. To see the current live version checkout the [main branch](https://github.com/Sendouc/sendou.ink/tree/main)

## Running locally

### sendou.ink

Prerequisites: [nvm](https://github.com/nvm-sh/nvm)

There is a sequence of commands you need to run:

1. `nvm use` to switch to the correct Node version. If you have problems with nvm you can also install the latest LTS version of Node.js from [their website](https://nodejs.org/en/).
2. `npm i` to install the dependencies.
3. Make a copy of `.env.example` that's called `.env`. See below for note about environment variables.
4. `npm run migrate up` to set up the database tables.
5. `npm run seed` to fill database with test data.
6. `npm run dev` to run the project in development mode.

And if you want to run the E2E tests:

6. Make a copy of the `db.sqlite3` file created by migration and name it `db-cypress.sqlite3`.
7. `npm run dev:cypress` and `npm run cy:open` can be used to run the E2E tests.

#### Environment variables

You don't need to fill the missing values from `.env.example` to get started. Instead of using real auth via Discord you can "impersonate" the admin (=Sendou#0043) or any other use in the /admin page once the project has started up. `LOHI_TOKEN` is only needed for bot + sendou.ink interoperability.

### Lohi

TODO: instructions on how to develop Lohi locally

## Contributing

Contributions very welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

## Project structure

```
sendou.ink/
├── app/
│   ├── components/ -- React components
│   ├── db/ -- Database layer
│   ├── hooks/ -- React hooks
│   ├── modules/ -- "nodu_modules but part of the app" https://twitter.com/ryanflorence/status/1535103735952658432
│   ├── routes/ -- Routes see: https://remix.run/docs/en/v1/guides/routing
│   ├── styles/ -- All .css files of the project for styling
│   ├── utils/ -- Random helper functions used in many places
│   └── permissions.ts / -- What actions are allowed. Separated by frontend and backend as frontend has constraints based on what user sees.
├── cypress/ -- see: https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Folder-structure
├── discord-bot/ -- Lohi Discord bot that works together with sendou.ink
├── migrations/ -- Database migrations
├── public/ -- Images, built assets etc. static files to be served as is
└── scripts/ -- Stand-alone scripts to be run outside of the app
```

## Commands

### Converting gifs (badges) to thumbnail

### png

```bash
sips -s format png ./*.gif --out .
```

### avif

https://github.com/lovell/avif-cli
