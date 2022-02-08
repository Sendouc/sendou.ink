import { Mode } from "@prisma/client";
import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { MapList } from "~/components/play/MapList";
import { DISCORD_URL } from "~/constants";
import * as LFGGroup from "~/models/LFGGroup.server";
import * as LFGMatch from "~/models/LFGMatch.server";
import styles from "~/styles/play-match.css";
import {
  getUser,
  listToUserReadableString,
  makeTitle,
  parseRequestFormData,
  requireUser,
  safeJSONParse,
  UserLean,
  validate,
} from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = ({ data }: { data: LFGMatchLoaderData }) => {
  return {
    title: data.isOwnMatch
      ? makeTitle(
          `vs. ${listToUserReadableString(
            data.groups[1].members.map(
              (u) => `${u.discordName}#${u.discordDiscriminator}`
            )
          )}`
        )
      : "Match",
  };
};

const matchActionSchema = z.union([
  z.object({
    _action: z.literal("LOOK_AGAIN"),
  }),
  z.object({
    _action: z.literal("REPORT_SCORE"),
    winnerIds: z.preprocess(
      safeJSONParse,
      z.array(z.string().uuid()).min(5).max(9)
    ),
  }),
]);

export const action: ActionFunction = async ({ request, context }) => {
  const data = await parseRequestFormData({
    request,
    schema: matchActionSchema,
  });
  const user = requireUser(context);

  const ownGroup = await LFGGroup.findActiveByMember(user);
  validate(ownGroup, "No active group");

  switch (data._action) {
    case "REPORT_SCORE": {
      validate(ownGroup.matchId, "No match for the group");
      await LFGMatch.reportScore({
        matchId: ownGroup.matchId,
        winnerIds: data.winnerIds,
      });
      break;
    }
    case "LOOK_AGAIN": {
      validate(!ownGroup.ranked, "Score reporting required");
      await LFGGroup.setInactive(ownGroup.id);
      return redirect("/play");
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }

  return { ok: data._action };

  // TODO: notify watchers
};

interface LFGMatchLoaderData {
  /** Can the user counterpick and report scores? */
  isCaptain: boolean;
  isOwnMatch: boolean;
  isRanked: boolean;
  groups: { id: string; members: UserLean[] }[];
  mapList: {
    name: string;
    mode: Mode;
    /** Did 0 index group or 1 index group take this map */
    winner?: number;
  }[];
  /** The final score. Shown if match is concluded */
  score?: [number, number];
}

export const loader: LoaderFunction = async ({ params, context }) => {
  invariant(typeof params.id === "string", "Expected params.bid to be string");
  const user = getUser(context);

  const match = await LFGMatch.findById(params.id);
  if (!match || match.groups.length !== 2) {
    throw new Response(null, { status: 404 });
  }

  const isRanked = match.groups.every((g) => g.ranked);
  const isOwnMatch = match.groups.some((g) =>
    g.members.some((m) => user?.id === m.user.id)
  );
  // Non-ranked matches are only of interest to participants
  if (!isRanked && !isOwnMatch) {
    throw new Response(null, { status: 404 });
  }

  const isCaptain = match.groups.some((g) =>
    g.members.some((m) => m.user.id === user?.id && m.captain)
  );
  const groups = match.groups
    .sort((a, b) => {
      const aIsOwnGroup = a.members.some((m) => user?.id === m.user.id);
      const bIsOwnGroup = b.members.some((m) => user?.id === m.user.id);

      return Number(bIsOwnGroup) - Number(aIsOwnGroup);
    })
    .map((g) => {
      return {
        id: g.id,
        members: g.members.map((g) => ({
          id: g.user.id,
          discordId: g.user.discordId,
          discordAvatar: g.user.discordAvatar,
          discordName: g.user.discordName,
          discordDiscriminator: g.user.discordDiscriminator,
        })),
      };
    });
  const score = match.stages[0].winnerGroupId
    ? match.stages.reduce(
        (acc: [number, number], stage) => {
          if (!stage.winnerGroupId) return acc;
          if (stage.winnerGroupId === groups[0].id) acc[0]++;
          else acc[1]++;
          return acc;
        },
        [0, 0]
      )
    : undefined;
  return json<LFGMatchLoaderData>({
    isCaptain,
    isRanked,
    isOwnMatch,
    groups,
    score,
    mapList: match.stages
      .map(({ stage, winnerGroupId }) => {
        const winner = () => {
          if (!winnerGroupId) return undefined;

          return groups[0].id === winnerGroupId ? 0 : 1;
        };
        return {
          ...stage,
          winner: winner(),
        };
      })
      .filter((stage) => !score || typeof stage.winner === "number"),
  });
};

export default function LFGMatchPage() {
  const data = useLoaderData<LFGMatchLoaderData>();
  const transition = useTransition();

  return (
    <div className="container">
      <div className="play-match__waves">
        <div className="play-match__teams">
          {data.groups.map((g, i) => {
            return (
              <div
                key={i}
                className="play-match__waves-section play-match__players"
              >
                {g.members.map((user) => (
                  <div key={user.id} className="play-match__player">
                    <Avatar user={user} />
                    <span className="play-match__player-name">
                      {user.discordName}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {!data.isRanked && (
          <div className="play-match__waves-section play-match__info">
            This is your match! You can reach out to your opponents{" "}
            <a href={DISCORD_URL}>our Discord</a> in the{" "}
            <code>#match-meetup</code> channel.
          </div>
        )}
      </div>
      {!data.isRanked && (
        <div className="play-match__waves-button">
          <Form method="post">
            {data.isCaptain && (
              <Button
                type="submit"
                name="_action"
                value="LOOK_AGAIN"
                tiny
                variant="outlined"
                loading={transition.state !== "idle"}
              >
                Look again
              </Button>
            )}
          </Form>
        </div>
      )}
      {!data.score && (
        <MapList
          mapList={data.mapList}
          canSubmitScore={data.isCaptain}
          groupIds={{
            our: data.groups[0].id,
            their: data.groups[1].id,
          }}
        />
      )}
    </div>
  );
}
