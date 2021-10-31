# sendou.ink (Splatoon 3)

Next version of sendou.ink

⚠️ This branch is still experimental and likely to have very big changes quickly

## Getting started

> If these instructions are wrong please make an issue and let's fix them

Prerequisites: [Node.js](https://nodejs.org/en/) & PostgreSQL running locally ([guide](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database))

You might be able to skip steps 2-4 and use a few pages but most pages need a server with database connected.

1. Install dependencies with running `npm install` command in the root folder
2. Make a copy of the .env.sample file in the /server folder and name it .env

- See below for documentation about what the values mean and which are optional

3. In the /server folder seed the database with the `npm run seed` command
4. In the /server folder run the development server with the `npm run dev` command
5. Make a copy of the .env.sample file in the /frontend folder and name it .env.local

- See below for documentation about what the values mean and which are optional

6. In the /frontend folder run the app with the `npm run dev` command

## .env

### /server

| Name                  | Description                                                                                                 | Required |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| DATABASE_URL          | Database connection string. For example mine is currently `postgresql://sendou@localhost:5432/sendou_ink_3` | Yes      |
| DISCORD_CLIENT_ID     | Used for auth. Make an application on [Discord](https://discord.com/developers/applications)                | No       |
| DISCORD_CLIENT_SECRET | See above.                                                                                                  | No       |
| DISCORD_CALLBACK_URL  | See above.                                                                                                  | No       |
| FRONTEND_URL          | Where frontend is located. Cell                                                                             | Yes      |
| NODE_ENV              | `development` when developing, `production` in production                                                   | Yes      |

### /frontend

| Name                    | Description               | Required |
| ----------------------- | ------------------------- | -------- |
| NEXT_PUBLIC_BACKEND_URL | Where backend is located. | Yes      |

## Folder structure

### /api

TypeScript types that acts as a pact between frontend and backend.

### /frontend

This folder contains frontend specific code.

```
frontend/
├── __mocks__/           mocks for tests
├── assets/              images and other assets to be imported directly to code
├── components/          react components
├── hooks/               react hooks including data fetching logic
└── utils/               frontend specific utility methods, constants etc.
```

### /server

This folder contains backend specific code.

```
server/
├── index.ts/               entry point
├── routes/                 route handling logic (controllers)
├── middleware/             middlewares that are called before controllers
├── services/               methods that talk to the database
├── core/                   business logic
└── prisma/
    ├── migrations/         migrations
    ├── schema.prisma       database models
    └── seed.ts             seeding script
```

### /shared

Utilities, constants etc. that are shared between frontend and backend.
