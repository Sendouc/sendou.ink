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
  ShouldReloadFunction,
  useActionData,
  useLoaderData,
  useParams,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Chat } from "~/components/Chat";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { ClockIcon } from "~/components/icons/Clock";
import { ModeImage } from "~/components/ModeImage";
import { DetailedPlayers } from "~/components/play/DetailedPlayers";
import { MapList } from "~/components/play/MapList";
import { MatchTeams } from "~/components/play/MatchTeams";
import { SubmitButton } from "~/components/SubmitButton";
import { DISCORD_URL, LFG_AMOUNT_OF_STAGES_TO_GENERATE } from "~/constants";
import { isAdmin } from "~/core/common/permissions";
import { requestMatchDetails } from "~/core/lanista";
import {
  groupsToWinningAndLosingPlayerIds,
  scoresAreIdentical,
} from "~/core/play/utils";
import { isGroupAdmin, matchIsUnranked } from "~/core/play/validators";
import { useUser } from "~/hooks/common";
import * as LFGGroup from "~/models/LFGGroup.server";
import * as LFGMatch from "~/models/LFGMatch.server";
import styles from "~/styles/play-match.css";
import {
  getUser,
  isTestUser,
  listToUserReadableString,
  makeTitle,
  parseRequestFormData,
  requireUser,
  safeJSONParse,
  Unpacked,
  UserLean,
  validate,
} from "~/utils";
import {
  chatRoute,
  sendouQAddPlayersPage,
  sendouQFrontPage,
} from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = ({
  data,
}: {
  data: Nullable<LFGMatchLoaderData>;
}) => {
  return {
    title: makeTitle(
      data?.isOwnMatch
        ? `vs. ${listToUserReadableString(
            data.groups[1].members.map((u) => u.discordName)
          )}`
        : "Match"
    ),
  };
};

const matchActionSchema = z.union([
  z.object({
    _action: z.enum([
      "LOOK_AGAIN",
      "PLAY_AGAIN_SAME_GROUP",
      "PLAY_AGAIN_DIFFERENT_GROUP",
      "DELETE_MATCH",
    ]),
  }),
  z.object({
    _action: z.enum(["REPORT_SCORE", "EDIT_REPORTED_SCORE"]),
    winnerIds: z.preprocess(
      safeJSONParse,
      z
        .array(z.string().uuid())
        .min(Math.ceil(LFG_AMOUNT_OF_STAGES_TO_GENERATE / 2))
        .max(LFG_AMOUNT_OF_STAGES_TO_GENERATE)
    ),
  }),
]);

export type MatchActionData = {
  error?: "DIFFERENT_SCORE" | "ALREADY_IN_GROUP";
  ok?: z.infer<typeof matchActionSchema>["_action"];
};

export const action: ActionFunction = async ({
  request,
  context,
  params,
}): Promise<MatchActionData | Response> => {
  invariant(typeof params.id === "string", "Expected params.id to be string");
  const data = await parseRequestFormData({
    request,
    schema: matchActionSchema,
  });
  const user = requireUser(context);

  const match = await LFGMatch.findById(params.id);
  invariant(match, "Match is undefined");

  let ownGroup = match.groups.find((g) =>
    g.members.some((m) => m.memberId === user.id)
  );
  if (!ownGroup && isAdmin(user.id)) {
    ownGroup = match.groups[0];
  }

  validate(ownGroup, "Not own match");
  const validateIsGroupAdmin = () =>
    validate(isGroupAdmin({ group: ownGroup, user }), "Not group admin");

  switch (data._action) {
    case "REPORT_SCORE": {
      validateIsGroupAdmin();
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

      await requestMatchDetails({
        matchId: params.id,
        startTime: match.createdAt,
        playedStages: match.stages
          .slice(0, data.winnerIds.length)
          .map(({ stage }) => ({ mode: stage.mode, stage: stage.name })),
        playerDiscordIds: match.groups
          .flatMap((g) => g.members)
          .map((m) => m.user.discordId),
      });

      return { ok: "REPORT_SCORE" };
    }
    case "EDIT_REPORTED_SCORE": {
      validate(isAdmin(user.id), "Not admin");

      await LFGMatch.overrideScores({
        UNSAFE_matchId: params.id,
        UNSAFE_winnerGroupIds: data.winnerIds,
      });

      return { ok: "EDIT_REPORTED_SCORE" };
    }
    case "DELETE_MATCH": {
      validate(isAdmin(user.id), "Not admin");

      await LFGMatch.deleteMatch(params.id);

      return redirect(sendouQFrontPage());
    }
    case "LOOK_AGAIN": {
      validate(matchIsUnranked(match), "Score reporting required");
      await LFGGroup.setInactive(ownGroup.id);
      return redirect("/play");
    }
    case "PLAY_AGAIN_SAME_GROUP": {
      validateIsGroupAdmin();
      const ids = await LFGGroup.activeUserIds();
      for (const member of ownGroup.members) {
        if (ids.has(member.memberId)) {
          return { error: "ALREADY_IN_GROUP" };
        }
      }

      await LFGGroup.createPrefilled({
        ranked: ownGroup.ranked,
        members: ownGroup.members.map((m) => ({
          memberId: m.memberId,
          captain: m.captain,
        })),
      });
      return redirect(sendouQAddPlayersPage());
    }
    case "PLAY_AGAIN_DIFFERENT_GROUP": {
      validateIsGroupAdmin();
      const ids = await LFGGroup.activeUserIds();
      if (ids.has(user.id)) {
        return redirect(sendouQFrontPage());
      }

      await LFGGroup.createPrefilled({
        ranked: ownGroup.ranked,
        members: [
          {
            memberId: user.id,
            captain: true,
          },
        ],
      });
      return redirect(sendouQAddPlayersPage());
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

export const unstable_shouldReload: ShouldReloadFunction = (data) => {
  return data.submission?.action !== chatRoute();
};

export interface LFGMatchLoaderData {
  /** Can the user counterpick and report scores? */
  isCaptain: boolean;
  isOwnMatch: boolean;
  isRanked: boolean;
  createdAtTimestamp: number;
  groups: { id: string; members: (UserLean & { friendCode?: string })[] }[];
  mapList: {
    name: string;
    mode: Mode;
    /** Did 0 index group or 1 index group take this map */
    winner?: number;
    detail?: Unpacked<
      Unpacked<NonNullable<LFGMatch.FindById>["stages"]>["details"]
    >;
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
          friendCode: g.user.friendCode ?? undefined,
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
    createdAtTimestamp: new Date(match.createdAt).getTime(),
    mapList: match.stages.map(({ stage, winnerGroupId, details }) => {
      const winner = () => {
        if (!winnerGroupId) return undefined;

        return groups[0].id === winnerGroupId ? 0 : 1;
      };
      return {
        ...stage,
        winner: winner(),
        detail: details[0],
      };
    }),
  });
};

export default function LFGMatchPage() {
  const data = useLoaderData<LFGMatchLoaderData>();
  const transition = useTransition();
  const actionData = useActionData<MatchActionData>();
  const user = useUser();
  const [adminEditActive, setAdminEditActive] = React.useState(false);

  const params = useParams();
  invariant(params.id, "!params.id");

  const matchStartedInTheLastHour = () => {
    const oneHourAgo = new Date(
      new Date().getTime() - 60 * 60 * 1_000
    ).getTime();
    if (data.createdAtTimestamp > oneHourAgo) return true;

    return false;
  };

  const showPlayAgainSection = () => {
    if (!data.isCaptain) return false;
    if (!data.scores) return false;
    if (!matchStartedInTheLastHour()) return false;

    return true;
  };

  React.useEffect(() => {
    if (actionData?.ok === "EDIT_REPORTED_SCORE") {
      setAdminEditActive(false);
    }
  }, [actionData]);

  return (
    <>
      {data.isOwnMatch &&
        matchStartedInTheLastHour() &&
        isTestUser(user?.id) && (
          <Chat
            id={params.id}
            users={Object.fromEntries(
              data.groups
                .flatMap((g) => g.members)
                .map((m) => [m.id, { name: m.discordName, info: m.friendCode }])
            )}
          />
        )}
      <div>
        {actionData?.error === "DIFFERENT_SCORE" && (
          <div className="play-match__error">
            The score you reported is different from what your opponent
            reported. If you think the information below is wrong notify us on
            the #helpdesk channel of our <a href={DISCORD_URL}>Discord</a>{" "}
            channel
          </div>
        )}
        <div className="play-match__waves">
          <MatchTeams />
          <div className="play-match__time">
            {new Date(data.createdAtTimestamp).toLocaleString("en-us", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
          {!data.isRanked && (
            <div className="play-match__waves-section play-match__info">
              This is your match! You can reach out to your opponents{" "}
              <a href={DISCORD_URL}>our Discord</a> in the{" "}
              <code>#match-meetup</code> channel.
            </div>
          )}
          {showPlayAgainSection() && (
            <Form method="post">
              <div className="play-match__waves-section play-match__play-again-container">
                {actionData?.error === "ALREADY_IN_GROUP" ? (
                  <span className="text-color-error">
                    Some group member is already in a new group
                  </span>
                ) : (
                  <>
                    Want to play again?
                    <Button
                      name="_action"
                      value="PLAY_AGAIN_SAME_GROUP"
                      tiny
                      className="play-match__play-again-button"
                    >
                      Same group
                    </Button>
                    <Button
                      name="_action"
                      value="PLAY_AGAIN_DIFFERENT_GROUP"
                      variant="outlined"
                      tiny
                      className="play-match__play-again-button"
                    >
                      New group
                    </Button>
                  </>
                )}
              </div>
            </Form>
          )}
          {data.scores && !adminEditActive && (
            <div className="play-match__played-map-list">
              {data.mapList
                .filter((stage) => typeof stage.winner === "number")
                .map((stage) => {
                  const pointsScored = stage.detail?.teams.map((t) => t.score);
                  const [biggerScore, smallerScore] = (pointsScored ?? []).sort(
                    (a, b) => b - a
                  );
                  const secondsToDisplay = (duration: number) => {
                    let minutes = 0;
                    let seconds = duration;

                    while (seconds >= 60) {
                      seconds -= 60;
                      minutes++;
                    }

                    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
                  };
                  const leftTeamDetails = stage.detail?.teams.find(
                    (t) =>
                      (t.isWinner && stage.winner === 0) ||
                      (!t.isWinner && stage.winner === 1)
                  );
                  const rightTeamDetails = stage.detail?.teams.find(
                    (t) =>
                      (t.isWinner && stage.winner === 1) ||
                      (!t.isWinner && stage.winner === 0)
                  );

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
                        {stage.detail?.duration && (
                          <div className="play-match__clock">
                            <ClockIcon />{" "}
                            {secondsToDisplay(stage.detail.duration)}
                          </div>
                        )}
                        {pointsScored && (
                          <div className="play-match__stage-score">
                            {pointsScored.some((p) => p === 100) ? (
                              "KO"
                            ) : (
                              <>
                                {stage.winner === 0
                                  ? biggerScore
                                  : smallerScore}
                                -
                                {stage.winner === 1
                                  ? biggerScore
                                  : smallerScore}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div
                        className={clsx("play-match__checkmark", {
                          invisible: stage.winner !== 1,
                        })}
                      >
                        <CheckmarkIcon />
                      </div>
                      {leftTeamDetails && rightTeamDetails && (
                        <>
                          <DetailedPlayers players={leftTeamDetails.players} />
                          <div className="play-match__players-spacer" />
                          <DetailedPlayers
                            players={rightTeamDetails.players}
                            bravo
                          />
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
            </div>
          )}
          {isAdmin(user?.id) && data.scores && (
            <Form method="post">
              <div className="flex justify-center mt-4 gap-4">
                <Button
                  tiny
                  variant={adminEditActive ? "destructive" : undefined}
                  onClick={() => setAdminEditActive((isActive) => !isActive)}
                  type="button"
                >
                  {adminEditActive ? "Cancel" : "Edit"}
                </Button>
                {!adminEditActive && (
                  <SubmitButton
                    tiny
                    variant="destructive"
                    name="_action"
                    value="DELETE_MATCH"
                    actionType="DELETE_MATCH"
                    onClick={(e) => {
                      if (!confirm("Delete match?")) {
                        e.preventDefault();
                      }
                    }}
                    loadingText="Deleting..."
                  >
                    Delete
                  </SubmitButton>
                )}
              </div>
            </Form>
          )}
        </div>
        {!data.isRanked && (
          <div className="play-match__waves-button">
            <Form method="post">
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
            </Form>
          </div>
        )}
        {(!data.scores || adminEditActive) && data.isRanked && (
          <MapList
            mapList={data.mapList}
            reportedWinnerIds={data.mapList
              .filter((m) => typeof m.winner === "number")
              .map((m) => {
                const winnerGroup = data.groups[m.winner as number];
                invariant(winnerGroup, "Unexpected winnerGroup is undefined");
                return winnerGroup.id;
              })}
            canSubmitScore={data.isCaptain || isAdmin(user?.id)}
            groupIds={{
              our: data.groups[0].id,
              their: data.groups[1].id,
            }}
          />
        )}
      </div>
    </>
  );
}
