import type { ActionFunction } from "@remix-run/node";
import { z } from "zod";
import { getUser } from "~/modules/auth";
import { canAccessLohiEndpoint, canPerformAdminActions } from "~/permissions";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { fetchWithTimeout } from "~/utils/fetch";

const PATREON_INITIAL_URL =
  "https://www.patreon.com/api/oauth2/api/campaigns/2744004/pledges?include=patron.null,reward.null";

// tier 1 lowest, tier 4 highest
const TIER_1_ID = "6959473";
const TIER_2_ID = "6381152";
const TIER_3_ID = "6381153";
const TIER_4_ID = "6959564";

function idToTier(id: string) {
  const tier = [null, TIER_1_ID, TIER_2_ID, TIER_3_ID, TIER_4_ID].indexOf(id);

  if (tier === -1) throw new Error(`Invalid tier id: ${id}`);

  return tier;
}

interface ParsedPatron {
  discordId: string;
  tier: number;
  createdAtTimestamp: number;
}

interface NoDiscordConnectionUser {
  email: string;
  name: string;
}

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);

  if (!canPerformAdminActions(user) && !canAccessLohiEndpoint(request)) {
    throw new Response("Not authorized", { status: 403 });
  }

  const patrons: Array<ParsedPatron> = [];
  const noDiscordConnected: Array<NoDiscordConnectionUser> = [];
  const noDataIds: Array<string> = [];
  let nextUrlToFetchWith: string | undefined;

  while (true) {
    const patronData = await fetchPatronData(nextUrlToFetchWith);

    const parsed = parsePatronData(patronData);
    patrons.push(...parsed.patrons);
    noDiscordConnected.push(...parsed.noDiscordConnection);
    noDataIds.push(...parsed.noDataIds);

    if (!patronData.links.next) break;

    nextUrlToFetchWith = patronData.links.next;
  }

  return new Response(
    `Added ${patrons.length} patrons. ${
      noDiscordConnected.length
    } patrons had no Discord connected. No full data for following Patreon ID's: ${noDataIds.join(
      ", "
    )}`,
    { status: 200 }
  );
};

const patronResponseSchema = z.object({
  data: z.array(
    z.object({
      attributes: z.object({
        declined_since: z.string().nullable(),
        created_at: z.string(),
      }),
      relationships: z.object({
        patron: z.object({ data: z.object({ id: z.string() }) }),
        reward: z.object({
          data: z.object({
            id: z.enum([TIER_1_ID, TIER_2_ID, TIER_3_ID, TIER_4_ID]),
          }),
        }),
      }),
    })
  ),
  included: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("user"),
        id: z.string(),
        attributes: z.object({
          email: z.string(),
          full_name: z.string(),
          social_connections: z.object({
            discord: z.object({ user_id: z.string() }).nullable(),
          }),
        }),
      }),
      z.object({ type: z.literal("reward") }),
      z.object({ type: z.literal("goal") }),
      z.object({ type: z.literal("campaign") }),
    ])
  ),
  links: z.object({ next: z.string().nullish() }),
});

async function fetchPatronData(nextUrl?: string) {
  if (!process.env["PATREON_ACCESS_TOKEN"]) {
    throw new Response("Missing Patreon access token", { status: 500 });
  }

  const response = await fetchWithTimeout(
    nextUrl ?? PATREON_INITIAL_URL,
    {
      headers: {
        Authorization: `Bearer ${process.env["PATREON_ACCESS_TOKEN"]}`,
      },
    },
    30_000
  );

  if (!response.ok) {
    throw new Response(
      `Patreon response not succesful. Status code was: ${response.status}`,
      { status: 502 }
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
    } & Omit<ParsedPatron, "discordId">
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
      createdAtTimestamp: dateToDatabaseTimestamp(
        new Date(patron.attributes.created_at)
      ),
      tier: idToTier(patron.relationships.reward.data.id),
    });
  }

  const result: {
    patrons: Array<ParsedPatron>;
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
      createdAtTimestamp: patronData.createdAtTimestamp,
      discordId,
      tier: patronData.tier,
    });
  }

  return result;
}
