Note: This is the WIP Splatoon 3 version of the site. To see the current live version checkout the [main branch](https://github.com/Sendouc/sendou.ink/tree/main)

## Running locally

### sendou.ink

Prerequisites: [nvm](https://github.com/nvm-sh/nvm)

There is a sequence of commands you need to run:

1. `nvm use` to switch to the correct Node version. If you don't have the correct Node.js version yet it will prompt you to install it via the `nvm install` command. If you have problems with nvm you can also install the latest LTS version of Node.js from [their website](https://nodejs.org/en/).
2. `npm i` to install the dependencies.
3. Make a copy of `.env.example` that's called `.env`. Filling additional values is not necessary unless you want to use real Discord auth or develop Lohi bot.
4. `npm run migrate up` to set up the database tables.
5. `npm run dev` to run the project in development mode.
6. Navigate to `http://localhost:5800/admin`. There press the seed button to fill the DB with test data. You can also impersonate any user (Sendou#0043 = admin).

And if you want to run the E2E tests:

6. Make a copy of the `db.sqlite3` file created by migration and name it `db-cypress.sqlite3`.
7. `npm run dev:cypress` and `npm run cy:open` can be used to run the E2E tests.

## Lohi

TODO: instructions on how to develop Lohi locally

## Contributing

Contributions very welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

### Translations

[View progress](/translation-progress.md)

sendou.ink can be translated to any language. All the translations can be found in the [locales folder](./public/locales). Here is how you can contribute:

1. Copy a `.json` file from `/en` folder.
2. Translate lines one by one. For example `"country": "Country",` could become `"country": "Maa",`. Keep the "key" on the left side of : unchanged.
3. Finally send the translated .json to Sendou or make a pull request if you know how.

Things to note:

- `weapons.json` and `gear.json` are auto-generated. Don't touch these.
- If some language doesn't have a folder it can be added.
- Some translated `.json` files can also have some lines in English as new lines get added to the site. Those can then be translated.
- Some lines have a dynamic part like this one: `"articleBy": "by {{author}}"` in this case `{{author}}` should appear in the translated version unchanged. So in other words don't translate the part inside `{{}}`.
- There is one more special syntax to keep in mind. When you translate this line `"project": "Sendou.ink is a project by <2>Sendou</2> with help from contributors:",` the `<2></2>` should appear in the translated version. The text inside these tags can change.
- To update a translation file copy the existing file, do any modifications needed and send the updated one.
- Don't update translation-progress.md file directly. There is a script for this `npm run check-translation-jsons`. If you don't know how to run it then Sendou will run it for you.

Any questions please ask Sendou!

## API

If you want to use the API then please leave an issue explaing your use case. By default I want to allow open use of the data on the site. It's just not recommended to use the same API's the web pages use as they are not stable at all and can change at any time without warning.

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

### Converting gifs (badges) to thumbnail (.png)

```bash
sips -s format png ./sundae.gif --out .
```

### Add new badge to the database

```bash
npm run add-badge -- sundae "4v4 Sundaes"
```

### Convert many .png files to .avif

While in the folder with the images:

```bash
for i in *; do npx @squoosh/cli --avif '{"cqLevel":33,"cqAlphaLevel":-1,"denoiseLevel":0,"tileColsLog2":0,"tileRowsLog2":0,"speed":6,"subsample":1,"chromaDeltaQ":false,"sharpness":0,"tune":0}' $i; done
```

## How to...

### Download production database from Render.com

Note: This is only useful if you have access to a production running on Render.com

1. Access "Shell" tab
2. `cd /var/data`
3. `sqlite3 db.sqlite3` then inside sqlite3 CLI `.output dump`, `.dump` & `.quit`
4. `wormhole send dump`
5. On the receiver computer use the command shown.
6. `sqlite3 db-prod.sqlite3 < dump` on the receiver computer.

### Add a new weapon

1. Add image in both .png and .avif with the correct weapon ID (`replace-img-names.ts` can help)
2. Create new weapon ids json and weapon translation jsons using `create-weapon-json.ts` script
