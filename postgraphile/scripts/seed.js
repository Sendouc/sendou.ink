require("dotenv").config();
const { Client } = require("pg");
const faker = require("faker");

const stages = [
  "The Reef",
  "Musselforge Fitness",
  "Starfish Mainstage",
  "Humpback Pump Track",
  "Inkblot Art Academy",
  "Sturgeon Shipyard",
  "Moray Towers",
  "Port Mackerel",
  "Manta Maria",
  "Kelp Dome",
  "Snapper Canal",
  "Blackbelly Skatepark",
  "MakoMart",
  "Walleye Warehouse",
  "Shellendorf Institute",
  "Arowana Mall",
  "Goby Arena",
  "Piranha Pit",
  "Camp Triggerfish",
  "Wahoo World",
  "New Albacore Hotel",
  "Ancho-V Games",
  "Skipper Pavilion",
];

const modesShort = ["TW", "SZ", "TC", "RM", "CB"];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    await client.query(`
      insert into sendou_ink.account (discord_username, discord_discriminator, discord_avatar, twitch, twitter, youtube_id, youtube_name, discord_id)
      values ('Sendou', '0043', 'fcfd65a3bea598905abb9ca25296816b', 'Sendou', 'Sendouc', 'UCWbJLXByvsfQvTcR4HLPs5Q', 'Sendou', '79237403620945920');
    `);
    await client.query(`
      insert into sendou_ink.organization (identifier, name, discord_invite_code, twitter, owner_id)
      values ('sendous', 'Sendou´s tournaments', 'sendou', 'sendouc', 1);
    `);
    await client.query(`
      insert into sendou_ink.tournament (identifier, name, description, start_time, banner_background, banner_text_hsl_args, organization_identifier)
      values ('in-the-zone-x', 'In The Zone X', 'In The Zone eXtremeeeee', '2022-06-22 20:00:00', 'linear-gradient(to bottom, #9796f0, #fbc7d4)', '31 9% 16%', 'sendous');
    `);

    for (const stage of stages) {
      for (const mode of modesShort) {
        await client.query(`
          insert into sendou_ink.map_mode (stage, game_mode)
          values ('${stage}', '${mode}');
        `);
      }
    }

    await mapPool(client);
    await fakeUsers(client);
    await fakeTournamentTeams(client);
  } finally {
    client.end();
  }
}

async function mapPool(client) {
  const ids = Array.from(
    new Set(new Array(24).fill(null).map(() => getRandomInt(115)))
  );

  for (const id of ids) {
    await client.query(`
      insert into sendou_ink.map_pool (tournament_identifier, map_mode_id)
      values ('in-the-zone-x', '${id}');
    `);
  }
}

async function fakeUsers(client) {
  for (let index = 0; index < 200; index++) {
    const name = faker.name.firstName();
    const discordDiscriminator = Array(4)
      .fill(null)
      .map(() => faker.datatype.number(9))
      .join("");
    const discordId = Array(17)
      .fill(null)
      .map(() => faker.datatype.number(9))
      .join("");

    await client.query(`
      insert into sendou_ink.account (discord_username, discord_discriminator, discord_id)
      values ('${name}', '${discordDiscriminator}', '${discordId}');
    `);
  }
}

async function fakeTournamentTeams(client) {
  const randomIds = faker.helpers.shuffle(
    Array(201)
      .fill(null)
      .map((_, i) => i)
  );

  for (let index = 0; index < 24; index++) {
    const name = faker.address.cityName();
    const captainId = randomIds.pop();

    const {
      rows: [tournamentTeam],
    } = await client.query(`
      insert into sendou_ink.tournament_team (name, tournament_identifier)
      values ('${name}', 'in-the-zone-x')
      returning *;
    `);

    await client.query(`
      insert into sendou_ink.tournament_team_roster (member_id, tournament_team_id, captain)
      values ('${captainId}', '${tournamentTeam.id}', true)
      returning *;
    `);

    for (let index = 0; index < faker.datatype.number(6); index++) {
      const memberId = randomIds.pop();
      await client.query(`
      insert into sendou_ink.tournament_team_roster (member_id, tournament_team_id)
      values ('${memberId}', '${tournamentTeam.id}')
      returning *;
    `);
    }
  }
}

function getRandomInt(maxInclusive) {
  let result = -1;

  while (result < 24) {
    result = Math.floor(Math.random() * maxInclusive) + 1;
  }
  return result;
}

main();
