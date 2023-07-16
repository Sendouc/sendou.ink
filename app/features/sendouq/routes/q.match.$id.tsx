import {
  redirect,
  type ActionFunction,
  type LinksFunction,
  type LoaderArgs,
} from "@remix-run/node";
import { Main } from "~/components/Main";
import { matchIdFromParams } from "../q-utils";
import type { SendouRouteHandle } from "~/utils/remix";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { findMatchById } from "../queries/findMatchById.server";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { ModeImage, StageImage } from "~/components/Image";
import { useTranslation } from "~/hooks/useTranslation";
import {
  SENDOUQ_PAGE,
  SENDOUQ_PREPARING_PAGE,
  navIconUrl,
  teamPage,
  userPage,
  userSubmittedImage,
} from "~/utils/urls";
import type { GroupForMatch } from "../queries/groupForMatch.server";
import { groupForMatch } from "../queries/groupForMatch.server";
import invariant from "tiny-invariant";
import { databaseTimestampToDate } from "~/utils/dates";
import { useIsMounted } from "~/hooks/useIsMounted";
import clsx from "clsx";
import styles from "../q.css";
import { Avatar } from "~/components/Avatar";
import { useUser } from "~/modules/auth";
import * as React from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { animate } from "~/utils/flip";
import { matchEndedAtIndex } from "../core/match";
import { SubmitButton } from "~/components/SubmitButton";
import { requireUserId } from "~/modules/auth/user.server";
import { matchSchema } from "../q-schemas.server";
import { assertUnreachable } from "~/utils/types";
import { reportScore } from "../queries/reportScore.server";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { Button } from "~/components/Button";
import { RefreshArrowsIcon } from "~/components/icons/RefreshArrows";
import { ArchiveBoxIcon } from "~/components/icons/ArchiveBox";
import { createGroupFromPreviousGroup } from "../queries/createGroup.server";
import type { GroupMember } from "~/db/types";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["q", "tournament"],
  breadcrumb: () => ({
    imgPath: navIconUrl("sendouq"),
    href: SENDOUQ_PAGE,
    type: "IMAGE",
  }),
};

export const action: ActionFunction = async ({ request, params }) => {
  const matchId = matchIdFromParams(params);
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: matchSchema,
  });

  switch (data._action) {
    case "REPORT_SCORE": {
      const currentGroup = findCurrentGroupByUserId(user.id);
      validate(
        currentGroup && ["MANAGER", "OWNER"].includes(currentGroup.role),
        "You are not a manager or owner of the group"
      );

      const match = notFoundIfFalsy(findMatchById(matchId));
      if (match.reportedAt) return null;

      reportScore({
        matchId,
        reportedByUserId: user.id,
        winners: data.winners,
      }); // <-- xxx: add stats MapResult etc. + add season migration to Skill

      break;
    }
    case "LOOK_AGAIN": {
      const previousGroup = groupForMatch(data.previousGroupId);
      validate(previousGroup, "Previous group not found");

      for (const member of previousGroup.members) {
        const currentGroup = findCurrentGroupByUserId(member.id);
        validate(!currentGroup, "Member is already in a group");
        if (member.id === user.id) {
          validate(
            member.role === "OWNER",
            "You are not the owner of the group"
          );
        }
      }

      createGroupFromPreviousGroup({
        previousGroupId: data.previousGroupId,
        members: previousGroup.members.map((m) => ({ id: m.id, role: m.role })),
      });

      throw redirect(SENDOUQ_PREPARING_PAGE);
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export const loader = ({ params }: LoaderArgs) => {
  const matchId = matchIdFromParams(params);
  const match = notFoundIfFalsy(findMatchById(matchId));

  const groupAlpha = groupForMatch(match.alphaGroupId);
  invariant(groupAlpha, "Group alpha not found");
  const groupBravo = groupForMatch(match.bravoGroupId);
  invariant(groupBravo, "Group bravo not found");

  return {
    match,
    groupAlpha,
    groupBravo,
  };
};

// xxx: report weapons? as a row where score report is now¨
// xxx: handle unranked
// xxx: admin can rereport both score and weapons
export default function QMatchPage() {
  const user = useUser();
  const isMounted = useIsMounted();
  const { i18n } = useTranslation();
  const data = useLoaderData<typeof loader>();

  const ownMember =
    data.groupAlpha.members.find((m) => m.id === user?.id) ??
    data.groupBravo.members.find((m) => m.id === user?.id);
  const canReportScore = Boolean(
    !data.match.reportedAt &&
      ownMember &&
      (ownMember.role === "MANAGER" || ownMember.role === "OWNER")
  );

  const ownGroupId = data.groupAlpha.members.some((m) => m.id === user?.id)
    ? data.groupAlpha.id
    : data.groupBravo.members.some((m) => m.id === user?.id)
    ? data.groupBravo.id
    : null;

  return (
    <Main className="q-match__container stack lg">
      <div className="q-match__header">
        <h2>Match #{data.match.id}</h2>
        <div
          className={clsx("text-xs text-lighter", {
            invisible: !isMounted,
          })}
        >
          {isMounted
            ? databaseTimestampToDate(data.match.createdAt).toLocaleString(
                i18n.language,
                {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }
              )
            : // reserve place
              "0/0/0 0:00"}
        </div>
      </div>
      {data.match.reportedAt ? (
        <>
          <Score reportedAt={data.match.reportedAt} />
          {ownGroupId && ownMember && data.match.reportedAt ? (
            <AfterMatchActions
              ownGroupId={ownGroupId}
              role={ownMember.role}
              reportedAt={data.match.reportedAt}
            />
          ) : null}
        </>
      ) : null}
      <div className="q-match__teams-container">
        <MatchGroup group={data.groupAlpha} side="ALPHA" />
        <MatchGroup group={data.groupBravo} side="BRAVO" />
      </div>
      <MapList canReportScore={canReportScore} />
    </Main>
  );
}

function Score({ reportedAt }: { reportedAt: number }) {
  const isMounted = useIsMounted();
  const { i18n } = useTranslation();
  const data = useLoaderData<typeof loader>();
  const reporter =
    data.groupAlpha.members.find((m) => m.id === data.match.reportedByUserId) ??
    data.groupBravo.members.find((m) => m.id === data.match.reportedByUserId);

  const score = data.match.mapList.reduce(
    (acc, cur) => {
      if (!cur.winnerGroupId) return acc;

      if (cur.winnerGroupId === data.match.alphaGroupId) {
        return [acc[0] + 1, acc[1]];
      }

      return [acc[0], acc[1] + 1];
    },
    [0, 0]
  );

  return (
    <div className="stack items-center line-height-tight">
      <div className="text-lg font-bold">{score.join(" - ")}</div>
      <div className={clsx("text-xs text-lighter", { invisible: !isMounted })}>
        Reported by {reporter?.discordName ?? "???"} at{" "}
        {isMounted
          ? databaseTimestampToDate(reportedAt).toLocaleString(i18n.language, {
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })
          : ""}
      </div>
    </div>
  );
}

function AfterMatchActions({
  ownGroupId,
  role,
  reportedAt,
}: {
  ownGroupId: number;
  role: GroupMember["role"];
  reportedAt: number;
}) {
  const fetcher = useFetcher();

  const wasReportedInTheLastHour =
    databaseTimestampToDate(reportedAt).getTime() > Date.now() - 3600 * 1000;
  const showLookAgain = role === "OWNER" && wasReportedInTheLastHour;

  return (
    <fetcher.Form
      method="post"
      className="stack horizontal justify-center md flex-wrap"
    >
      <input type="hidden" name="previousGroupId" value={ownGroupId} />
      {showLookAgain ? (
        <SubmitButton
          icon={<RefreshArrowsIcon />}
          state={fetcher.state}
          _action="LOOK_AGAIN"
        >
          Look again with same group
        </SubmitButton>
      ) : null}
      <Button icon={<ArchiveBoxIcon />}>Report used weapons</Button>
    </fetcher.Form>
  );
}

function MatchGroup({
  group,
  side,
}: {
  group: GroupForMatch;
  side: "ALPHA" | "BRAVO";
}) {
  return (
    <div className="stack sm items-center">
      <h3 className="text-lighter">{side}</h3>
      <div className="stack sm q-match__members-container">
        {group.team ? (
          <Link
            to={teamPage(group.team.customUrl)}
            className="stack horizontal xs font-bold"
            target="_blank"
          >
            {group.team.avatarUrl ? (
              <Avatar
                url={userSubmittedImage(group.team.avatarUrl)}
                size="xxs"
              />
            ) : null}
            {group.team.name}
          </Link>
        ) : null}
        {group.members.map((member) => (
          <Link
            key={member.discordId}
            to={userPage(member)}
            className="stack horizontal xs items-center"
            target="_blank"
          >
            <Avatar size="xxs" user={member} />
            <div className="text-sm text-main-forced font-body">
              {member.discordName}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MapList({ canReportScore }: { canReportScore: boolean }) {
  const { t } = useTranslation(["game-misc", "tournament"]);
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [winners, setWinners] = React.useState<("ALPHA" | "BRAVO")[]>([]);

  const pickInfo = (source: string) => {
    if (source === "TIEBREAKER") return t("tournament:pickInfo.tiebreaker");
    if (source === "BOTH") return t("tournament:pickInfo.both");
    if (source === "DEFAULT") return t("tournament:pickInfo.default");

    if (source === String(data.match.alphaGroupId)) {
      return t("tournament:pickInfo.team.specific", {
        team: "Alpha",
      });
    }

    return t("tournament:pickInfo.team.specific", {
      team: "Bravo",
    });
  };

  const handleReportScore = (i: number, side: "ALPHA" | "BRAVO") => () => {
    const newWinners = [...winners];
    newWinners[i] = side;

    // delete any scores that would have been after set ended (can happen when they go back to edit previously reported scores)

    const matchEndedAt = matchEndedAtIndex(newWinners);

    if (matchEndedAt) {
      newWinners.splice(matchEndedAt + 1);
    }

    setWinners(newWinners);
  };

  const scoreCanBeReported =
    Boolean(matchEndedAtIndex(winners)) && !data.match.reportedAt;
  const showWinnerReportRow = (i: number) => {
    if (!canReportScore) return false;

    if (i === 0) return true;

    if (scoreCanBeReported && !winners[i]) return false;

    const previous = winners[i - 1];
    return Boolean(previous);
  };

  const winningInfoText = (winnerId: number | null) => {
    if (!data.match.reportedAt) return null;

    if (!winnerId)
      return (
        <>
          • <i>Unplayed</i>
        </>
      );

    const winner = winnerId === data.match.alphaGroupId ? "Alpha" : "Bravo";

    return <>• {winner} won</>;
  };

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="winners" value={JSON.stringify(winners)} />
      <Flipper flipKey={winners.join("")}>
        <div className="stack md w-max mx-auto">
          {data.match.mapList.map((map, i) => {
            return (
              <div key={map.stageId} className="stack xs">
                <Flipped flipId={map.stageId}>
                  <div className="stack sm horizontal items-center">
                    <StageImage
                      stageId={map.stageId}
                      width={64}
                      className="rounded-sm"
                    />
                    <div>
                      <div className="text-sm stack horizontal xs items-center">
                        {i + 1}) <ModeImage mode={map.mode} size={18} />{" "}
                        {t(`game-misc:STAGE_${map.stageId}`)}
                      </div>
                      <div className="text-lighter text-xs">
                        {pickInfo(map.source)}{" "}
                        {winningInfoText(map.winnerGroupId)}
                      </div>
                    </div>
                  </div>
                </Flipped>
                {showWinnerReportRow(i) ? (
                  <Flipped
                    flipId={`${map.stageId}-report`}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onAppear={async (el: HTMLElement) => {
                      await animate(el, [{ opacity: 0 }, { opacity: 1 }], {
                        duration: 300,
                      });
                      el.style.opacity = "1";
                    }}
                  >
                    <div className="stack horizontal sm text-xs">
                      <label className="mb-0 text-theme-secondary">
                        Winner
                      </label>
                      <div className="stack sm horizontal items-center font-semi-bold">
                        <input
                          type="radio"
                          name={`winner-${i}`}
                          value="alpha"
                          id={`alpha-${i}`}
                          checked={winners[i] === "ALPHA"}
                          onChange={handleReportScore(i, "ALPHA")}
                        />
                        <label className="mb-0" htmlFor={`alpha-${i}`}>
                          Alpha
                        </label>
                      </div>
                      <div className="stack sm horizontal items-center font-semi-bold">
                        <input
                          type="radio"
                          name={`winner-${i}`}
                          value="bravo"
                          id={`bravo-${i}`}
                          checked={winners[i] === "BRAVO"}
                          onChange={handleReportScore(i, "BRAVO")}
                        />
                        <label className="mb-0" htmlFor={`bravo-${i}`}>
                          Bravo
                        </label>
                      </div>
                    </div>
                  </Flipped>
                ) : null}
              </div>
            );
          })}
        </div>
      </Flipper>
      {scoreCanBeReported ? (
        <div className="stack md items-center mt-4">
          <ResultSummary winners={winners} />
          <SubmitButton _action="REPORT_SCORE" state={fetcher.state}>
            Submit scores
          </SubmitButton>
        </div>
      ) : null}
    </fetcher.Form>
  );
}

function ResultSummary({ winners }: { winners: ("ALPHA" | "BRAVO")[] }) {
  const user = useUser();
  const data = useLoaderData<typeof loader>();

  const ownSide = data.groupAlpha.members.some((m) => m.id === user?.id)
    ? "ALPHA"
    : "BRAVO";

  const score = winners.reduce(
    (acc, cur) => {
      if (cur === "ALPHA") {
        return [acc[0] + 1, acc[1]];
      }

      return [acc[0], acc[1] + 1];
    },
    [0, 0]
  );

  const userWon =
    ownSide === "ALPHA" ? score[0] > score[1] : score[0] < score[1];

  return (
    <div
      className={clsx("text-sm font-semi-bold", {
        "text-success": userWon,
        "text-warning": !userWon,
      })}
    >
      Reporting {score.join("-")} {userWon ? "win" : "loss"}
    </div>
  );
}
