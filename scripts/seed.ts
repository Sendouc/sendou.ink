/* eslint-disable */

import {
  ADMIN_ID,
  ADMIN_TEST_AVATAR,
  ADMIN_TEST_DISCORD_ID,
  NZAP_ID,
  NZAP_TEST_AVATAR,
  NZAP_TEST_DISCORD_ID,
} from "~/constants";
import sql from "~/db/postgres";
import { readFileSync } from "fs";
import path from "path";

async function main() {
  if (!process.env.DATABASE_URL?.includes("localhost")) {
    throw Error(
      "Trying to seed a database not in localhost or DATABASE_URL env var is not set"
    );
  }

  await wipeDB();

  await users();
  await skills();
}

async function wipeDB() {
  const tables = ["skills", "users"];
  for (const table of tables) {
    await sql`delete from ${sql(table)}`;
  }
}

async function users() {
  const usersFromSendouInk = readFileSync(
    path.resolve("prisma", "seed", "users.json"),
    "utf8"
  );

  await Promise.all([
    sql`
      insert into users
        ${sql({
          id: ADMIN_ID,
          discordDiscriminator: "4059",
          discordId: ADMIN_TEST_DISCORD_ID,
          discordName: "Sendou",
          discordRefreshToken: "none",
          twitch: "Sendou",
          youtubeId: "UCWbJLXByvsfQvTcR4HLPs5Q",
          youtubeName: "Sendou",
          discordAvatar: ADMIN_TEST_AVATAR,
          twitter: "sendouc",
          miniBio: "Test bio\nXP3100 on my alt\n5-0 FTWin (close games)",
          weaponPool: ["Tenta Brella", "Mini Splatling", "Luna Blaster"],
          friendCode: "0109-3838-9398",
        })}
    `,
    sql`
      insert into users
        ${sql({
          id: NZAP_ID,
          discordDiscriminator: "6227",
          discordId: NZAP_TEST_DISCORD_ID,
          discordName: "N-ZAP",
          discordRefreshToken: "none",
          discordAvatar: NZAP_TEST_AVATAR,
        })}
    `,
  ]);

  await sql`alter table users alter column id restart with 3`;
  await sql`
    insert into users 
      ${sql(
        JSON.parse(usersFromSendouInk)
          .slice(0, 200)
          .map((user: any) => ({
            discordId: user.discordId,
            discordAvatar: user.discordAvatar,
            discordDiscriminator: user.discriminator,
            discordName: user.username,
            discordRefreshToken: "none",
            twitter: user.profile?.twitterName ?? null,
          }))
      )}
      `;
}

async function skills() {
  const users = (await sql`select * from users;`).filter(
    () => Math.random() < 0.9
  );

  await sql`
    insert into skills
      ${sql(
        users.map((u) => ({
          mu: Math.random() * 40 + 10,
          sigma: Math.random() * 10 + 1,
          userId: u.id,
        }))
      )}
  `;

  const now = new Date().getTime();
  await sql`
    insert into skills
      ${sql(
        new Array(5).fill(null).map((_, i) => ({
          mu: 30 + i,
          sigma: 15 - i,
          userId: ADMIN_ID,
          createdAt: new Date(now + i * 10000),
        }))
      )}
  `;
}

main()
  // eslint-disable-next-line no-console
  .then(() => console.log("done 🌱"))
  .catch((e) => console.error(e))
  .finally(() => sql.end());
