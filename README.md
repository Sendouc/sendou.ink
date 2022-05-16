Note: This is the WIP Splatoon 3 version of the site. To see the current live version checkout the [main branch](https://github.com/Sendouc/sendou.ink/tree/main)

## Running locally

Prerequisites: [nvm](https://github.com/nvm-sh/nvm)

There is a sequence of commands you need to run:

1. `nvm use` to switch to the correct Node version.
2. `npm i` to install the dependencies.
3. Make a copy of `.env.example` that's called `.env` and fill it with values.
4. `npm run migrate` to set up the database tables.
5. `npm run dev` to run both the server and frontend.

## Project structure

```
sendou.ink/
├── app/
│   ├── components/ -- React components
│   ├── core/ -- Core business logic
│   ├── db/ -- Database layer
│   ├── hooks/ -- React hooks
│   ├── routes/ -- Routes see: https://remix.run/docs/en/v1/guides/routing
│   ├── styles/ -- All .css files of the project for styling
│   └── utils/ -- Random helper functions used in many places
├── migrations/ -- Database migrations
├── cypress/ -- see: https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Folder-structure
├── public/ -- Images, built assets etc. static files to be served as is
└── scripts/ -- Stand-alone scripts to be run outside of the app
```
