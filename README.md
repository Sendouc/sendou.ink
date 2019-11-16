# ![s.ink logo](https://raw.githubusercontent.com/Sendouc/sendou-ink/master/utils/sink_banner.png)

![Screenshot](./screenshot.png)

[![Discord Server](https://discordapp.com/api/guilds/407936403356516365/embed.png)](https://discord.gg/J6NqUvt)

Goal of sendou.ink is to provide useful tools and resources for the competitive Splatoon community.

Live version: [https://sendou.ink/](https://sendou.ink/)

## What's happening

This site was originally a full stack web development school project. It is my first time working on a web site project of my own so it has been very much a learning experience in that sense. Although make no mistake it has been through several iterations already and I still have plans to keep improving as well as adding more functionality!

## Technologies used

- React
- Node.js
- GraphQL (Apollo Server)
- MongoDB (+Mongoose)
- Python (couple different scripts to parse data)

## Current features

🦑 [Maplist Generator](https://sendou.ink/maps)
Fully configure and randomly generate map lists to play on.

🦑 [Rotation Viewer](https://sendou.ink/rotation)
View the upcoming rotations in the matchmaking and mark maps as unfavored. Unfavored maps are saved without having to register.

🦑 [Build Viewer](https://sendou.ink/builds)
Search for builds by weapon submitted by other users.

🦑 [Tournament Viewer](https://sendou.ink/tournaments)
Browser past tournaments of the competitive scene. Included is filtering feature that allows you to find tournaments featuring certain team composition for example.

🦑 [Map Planner](https://sendou.ink/plans)
Make plans by drawing on maps using variety of tools. You can also save and load from file.

🦑 [X Rank Leaderboards](https://sendou.ink/xleaderboard)
X Rank (solo queue) leaderboards by weapon class. Ordered by the average of the top four historical scores.

🦑 [Top 500 Browser](https://sendou.ink/xsearch)
Filter and browse through thousands of X Rank placements dating back to May 2018.

🦑 [X Rank Trends](https://sendou.ink/trends)
Draw charts based on the appearance of different of different weapons in X Rank. Easily see the impact different patches had and how weapons compare to each other.

🦑 [Competitive Calendar](https://sendou.ink/calendar)
See all the upcoming events in the competitive Splatoon community on one page.

🦑 [Links](https://sendou.ink/links)
Links to all sorts of useful resources about competitive Splatoon.

You can also log in to save up to 100 builds of your own that can include your abilities, gear as well as description of it.

## Installation

1. Install [Node](https://nodejs.org/en/)
2. Use `npm install` in the root folder
3. Use `npm install` in the **/react-ui** folder
4. Use `npm run watch` in the root folder
5. Use `npm start` in the **/react-ui** folder

Server will run on [http://localhost:3001/](http://localhost:3001/)  
Front-end will run on [http://localhost:3000/](http://localhost:3000/)

## Contributing

You are welcome to create an issue or do a pull request.
