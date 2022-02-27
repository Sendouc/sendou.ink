import { Mode } from "@prisma/client";
import clsx from "clsx";
import React from "react";
import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { ModeImage } from "~/components/ModeImage";
import { MapList } from "~/components/play/MapList";
import { DISCORD_URL, LFG_AMOUNT_OF_STAGES_TO_GENERATE } from "~/constants";
import {
  groupsToWinningAndLosingPlayerIds,
  scoresAreIdentical,
} from "~/core/play/utils";
import { isGroupAdmin, matchIsUnranked } from "~/core/play/validators";
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
import { oldSendouInkUserProfile } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = ({
  data,
}: {
  data: Nullable<LFGMatchLoaderData>;
}) => {
  return {
    title: data?.isOwnMatch
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
      z
        .array(z.string().uuid())
        .min(Math.ceil(LFG_AMOUNT_OF_STAGES_TO_GENERATE / 2))
        .max(LFG_AMOUNT_OF_STAGES_TO_GENERATE)
    ),
  }),
]);

type ActionData = {
  error?: "DIFFERENT_SCORE";
  ok?: z.infer<typeof matchActionSchema>["_action"];
};

export const action: ActionFunction = async ({
  request,
  context,
  params,
}): Promise<ActionData | Response> => {
  invariant(typeof params.id === "string", "Expected params.id to be string");
  const data = await parseRequestFormData({
    request,
    schema: matchActionSchema,
  });
  const user = requireUser(context);

  const match = await LFGMatch.findById(params.id);
  invariant(match, "Match is undefined");
  const ownGroup = match.groups.find((g) =>
    g.members.some((m) => m.memberId === user.id)
  );
  validate(ownGroup, "Not own match");
  validate(isGroupAdmin({ group: ownGroup, user }), "Not group admin");

  switch (data._action) {
    case "REPORT_SCORE": {
      const matchWasAlreadyReported = match.stages.some(
        (stage) => stage.winnerGroupId
      );
      if (matchWasAlreadyReported) {
        // just don't do anything if they report same as someone else before them
        // to user it looks identical to if they were the first to submit
        if (
          scoresAreIdentical({
            stages: match.stages,
            winnerIds: data.winnerIds,
          })
        ) {
          break;
        }

        return { error: "DIFFERENT_SCORE" };
      }

      await LFGMatch.reportScore({
        UNSAFE_matchId: params.id,
        UNSAFE_winnerGroupIds: data.winnerIds,
        playerIds: groupsToWinningAndLosingPlayerIds({
          winnerGroupIds: data.winnerIds,
          groups: match.groups,
        }),
        groupIds: match.groups.map((g) => g.id),
      });
      break;
    }
    case "LOOK_AGAIN": {
      validate(matchIsUnranked(match), "Score reporting required");
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
  scores?: [number, number];
}

export const loader: LoaderFunction = async ({ params, context }) => {
  invariant(typeof params.id === "string", "Expected params.id to be string");
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
  const scores = match.stages[0]?.winnerGroupId
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
    scores,
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
      .filter((stage) => !scores || typeof stage.winner === "number"),
  });
};

// TODO: match time
export default function LFGMatchPage() {
  const data = useLoaderData<LFGMatchLoaderData>();
  const transition = useTransition();
  const actionData = useActionData<ActionData>();

  return (
    <div className="container">
      {actionData?.error === "DIFFERENT_SCORE" && (
        <div className="play-match__error">
          The score you reported is different from what your opponent reported.
          If you think the information below is wrong notify us on the #helpdesk
          channel of our <a href={DISCORD_URL}>Discord</a> channel
        </div>
      )}
      <div className="play-match__waves">
        <div className="play-match__teams">
          {data.groups.map((g, i) => {
            return (
              <div
                key={i}
                className="play-match__waves-section play-match__team-info"
              >
                {g.members.map((user) => (
                  <a
                    href={oldSendouInkUserProfile({
                      discordId: user.discordId,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div key={user.id} className="play-match__player">
                      <Avatar user={user} />
                      <span className="play-match__player-name">
                        {user.discordName}
                      </span>
                    </div>
                  </a>
                ))}
                {data.scores && (
                  <div
                    className={clsx("play-match__score", {
                      winner: data.scores[i] === Math.max(...data.scores),
                    })}
                  >
                    {data.scores[i]}
                  </div>
                )}
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
        {data.scores && (
          <div className="play-match__played-map-list">
            {data.mapList.map((stage) => {
              return (
                <React.Fragment key={`${stage.name}-${stage.mode}`}>
                  <div
                    className={clsx("play-match__checkmark", "left", {
                      invisible: stage.winner !== 0,
                    })}
                  >
                    <CheckmarkIcon />
                  </div>
                  <div className="play-match__played-stage">
                    <ModeImage
                      className="play-match__played-mode"
                      mode={stage.mode}
                    />
                    {stage.name}
                  </div>
                  <div
                    className={clsx("play-match__checkmark", {
                      invisible: stage.winner !== 1,
                    })}
                  >
                    <CheckmarkIcon />
                  </div>
                </React.Fragment>
              );
            })}
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
      {!data.scores && data.isRanked && (
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
