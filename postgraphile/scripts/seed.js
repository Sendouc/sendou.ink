require("dotenv").config();
const { Client } = require("pg");

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
      insert into sendou_ink.account (discord_username, discord_discriminator, discord_avatar, twitch, twitter, youtube_id, youtube_name)
      values ('Sendou', '0043', 'fcfd65a3bea598905abb9ca25296816b', 'Sendou', 'Sendouc', 'UCWbJLXByvsfQvTcR4HLPs5Q', 'Sendou');
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

    const ids = Array.from(
      new Set(new Array(24).fill(null).map(() => getRandomInt(115)))
    );

    for (const id of ids) {
      await client.query(`
        insert into sendou_ink.map_pool (tournament_identifier, map_mode_id)
        values ('in-the-zone-x', '${id}');
      `);
    }
  } finally {
    client.end();
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
