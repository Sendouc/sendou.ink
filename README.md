<p align="center">
<img src="https://github.com/Sendouc/sendou-ink/blob/master/sink-squid.png">
</p>
[![Discord Server](https://discordapp.com/api/guilds/407936403356516365/embed.png)](https://discord.gg/J6NqUvt)

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

## Trello

I use a [Trello board](https://trello.com/b/P46kMiY9/sendouink) to keep track of the things I still need to do and that are in progress. Anyone is free to check it out to see what bugs I am aware of as well as future plans for sendou.ink.

## Installation (TODO: improve this)

1. Install [Node](https://nodejs.org/en/)
2. Use `npm install` in the root folder
3. Use `npm install` in the **/react-ui** folder
4. Use `npm run watch` in the root folder
5. Use `npm start` in the **/react-ui** folder

In addition connection to MongoDB as well as a few other ENV variables need to be configured.

Server will run on [http://localhost:3001/](http://localhost:3001/)  
Front-end will run on [http://localhost:3000/](http://localhost:3000/)

## Contributing

You are welcome to create an issue or do a pull request.
