## Running locally

Prerequisites: [Node.js 16.13](https://nodejs.org/en/)

1) Run `npm i` to install the dependencies.
2) Make a copy of `.env.example` that's called `.env` and fill it with values.
- You can check [Prisma's guide](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database) on how to get PostgreSQL set up and running locally.
- Run `npm run seed` to seed the database with some test data.
3) Run `npm run dev` to run both the server and frontend.

## Commands

### Convert .png to .webp

`cwebp -q 80 image.png -o image.webp`
