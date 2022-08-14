import type { z } from "zod";
import { db } from "~/db";
import type { UpdatePatronDataArgs } from "~/db/models/users/users.server";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { fetchWithTimeout } from "~/utils/fetch";
import type { Unpacked } from "~/utils/types";
import {
  PATREON_INITIAL_URL,
  TIER_1_ID,
  TIER_2_ID,
  TIER_3_ID,
  TIER_4_ID,
} from "./constants";
import { patronResponseSchema } from "./schema";

interface NoDiscordConnectionUser {
  email: string;
  name: string;
}

export async function updatePatreonData(): Promise<void> {
  const patrons: UpdatePatronDataArgs = [];
  const noDiscordConnected: Array<NoDiscordConnectionUser> = [];
  const noDataIds: Array<string> = [];
  let nextUrlToFetchWith = PATREON_INITIAL_URL;

  while (nextUrlToFetchWith) {
    const patronData = await fetchPatronData(nextUrlToFetchWith);

    const parsed = parsePatronData(patronData);
    patrons.push(...parsed.patrons);
    noDiscordConnected.push(...parsed.noDiscordConnection);
    noDataIds.push(...parsed.noDataIds);

    // TS freaks out if we don't keep nextUrlToFetchWith string so that's why this weird thing here
    nextUrlToFetchWith = patronData.links.next ?? "";
  }

  db.users.updatePatronData(patrons);

  // eslint-disable-next-line no-console
  console.log(
    `Added ${patrons.length} patrons. ${
      noDiscordConnected.length
    } patrons had no Discord connected. No full data for following Patreon ID's: ${noDataIds.join(
      ", "
    )}`
  );
}

async function fetchPatronData(urlToFetch: string) {
  if (!process.env["PATREON_ACCESS_TOKEN"]) {
    throw new Error("Missing Patreon access token");
  }

  const response = await fetchWithTimeout(
    urlToFetch,
    {
      headers: {
        Authorization: `Bearer ${process.env["PATREON_ACCESS_TOKEN"]}`,
      },
    },
    30_000
  );

  if (!response.ok) {
    throw new Error(
      `Patreon response not succesful. Status code was: ${response.status}`
    );
  }

  return patronResponseSchema.parse(await response.json());
}

function parsePatronData({
  data,
  included,
}: z.infer<typeof patronResponseSchema>) {
  const patronsWithIds: Array<
    {
      patreonId: string;
    } & Omit<Unpacked<UpdatePatronDataArgs>, "discordId">
  > = [];

  for (const patron of data) {
    // from Patreon:
    // "declined_since indicates the date of the most recent payment if it failed, or `null` if the most recent payment succeeded.
    // A pledge with a non-null declined_since should be treated as invalid."
    if (patron.attributes.declined_since) {
      continue;
    }

    patronsWithIds.push({
      patreonId: patron.relationships.patron.data.id,
      patronSince: dateToDatabaseTimestamp(
        new Date(patron.attributes.created_at)
      ),
      patronTier: idToTier(patron.relationships.reward.data.id),
    });
  }

  const result: {
    patrons: UpdatePatronDataArgs;
    noDiscordConnection: Array<NoDiscordConnectionUser>;
    noDataIds: string[];
  } = {
    patrons: [],
    noDiscordConnection: [],
    noDataIds: [],
  };
  for (const extraData of included) {
    if (extraData.type !== "user") continue;

    const patronData = patronsWithIds.find((p) => p.patreonId === extraData.id);
    if (!patronData) {
      result.noDataIds.push(extraData.id);
      continue;
    }

    const discordId = extraData.attributes.social_connections.discord?.user_id;
    if (!discordId) {
      result.noDiscordConnection.push({
        email: extraData.attributes.email,
        name: extraData.attributes.full_name,
      });
      continue;
    }

    result.patrons.push({
      patronSince: patronData.patronSince,
      discordId,
      patronTier: patronData.patronTier,
    });
  }

  return result;
}

function idToTier(id: string) {
  const tier = [null, TIER_1_ID, TIER_2_ID, TIER_3_ID, TIER_4_ID].indexOf(id);

  if (tier === -1) throw new Error(`Invalid tier id: ${id}`);

  return tier;
}
