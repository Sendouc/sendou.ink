[![Discord Server](https://discordapp.com/api/guilds/299182152161951744/embed.png)](https://discord.gg/sendou)

Goal of sendou.ink is to provide useful tools and resources for the competitive Splatoon community.

Live version: [https://sendou.ink/](https://sendou.ink/)

## What's happening

This site was originally a full stack web development school project. Since I have continued working on it as a hobby. I use a big portion of the tools offered by it myself so finding continued motivation has been easy.

## Technologies used

- React
- TypeScript
- Node.js
- GraphQL (Apollo Server)
- MongoDB (+Mongoose)
- Python (a couple of different scripts to parse data)

## A few highlight features

🦑 Planner tool where you can draw on any map in the game to conveniently make up game plans

🦑 Calendar that collects together all the events happening in the community

🦑 Users can make an account and submit their builds and browse builds made by others

🦑 It is possible to submit yourself as "free agent". If two FA's like each other they are notified and a new team can be founded

🦑 X Rank Top 500 results can be browsed through far more conveniently than on the official app

🦑 Browse through detailed tournament results

🦑 Choose between light and dark mode as well as 10 different accent colors

## GraphQL

Serving the site is a GraphQL API. You can explore the schema here: [https://sendou.ink/graphql](https://sendou.ink/graphql). It was made specifically for this site but you are free to use it within reason if it is of use to you.

## Installation & getting started

1. Install [Node](https://nodejs.org/en/)
2. Use the `npm run install:all` command in the root folder
3. Make a copy of the `.env.template` file and rename it to `.env`. Populate the values depending on what you are developing. Database URI's at least are necessary to spin up the backend.
4. Use the `npm run dev` command in the root folder to develop logged out and `npm run dev:loggedin` to develop logged in as a mocked user.

- Please note that the scripts are currently assuming an \*NIX based system so trying to run them on PowerShell or something might not work.

Making the installation process smoother is one big point of improvement hopefully in the near future.

Server will run on [http://localhost:3001/graphql](http://localhost:3001/)  
Front-end will run on [http://localhost:3000/](http://localhost:3000/)

## Contributing

You are welcome to create an issue or do a pull request.
