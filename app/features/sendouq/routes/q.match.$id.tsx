import type {
  ActionArgs,
  LinksFunction,
  LoaderArgs,
  SerializeFrom,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { FetcherWithComponents } from "@remix-run/react";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { WeaponCombobox } from "~/components/Combobox";
import { Divider } from "~/components/Divider";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { ModeImage, StageImage, WeaponImage } from "~/components/Image";
import { Main } from "~/components/Main";
import { Popover } from "~/components/Popover";
import { SubmitButton } from "~/components/SubmitButton";
import { Toggle } from "~/components/Toggle";
import { ArchiveBoxIcon } from "~/components/icons/ArchiveBox";
import { RefreshArrowsIcon } from "~/components/icons/RefreshArrows";
import { sql } from "~/db/sql";
import type { GroupMember, ReportedWeapon } from "~/db/types";
import * as NotificationService from "~/features/chat/NotificationService.server";
import type { ChatMessage } from "~/features/chat/chat-types";
import { ConnectedChat, type ChatProps } from "~/features/chat/components/Chat";
import { currentSeason } from "~/features/mmr";
import { resolveRoomPass } from "~/features/tournament-bracket/tournament-bracket-utils";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { getUserId, requireUser } from "~/modules/auth/user.server";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { isMod } from "~/permissions";
import { cache } from "~/utils/cache.server";
import { databaseTimestampToDate } from "~/utils/dates";
import { animate } from "~/utils/flip";
import type { SendouRouteHandle } from "~/utils/remix";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { inGameNameWithoutDiscriminator } from "~/utils/strings";
import type { Unpacked } from "~/utils/types";
import { assertUnreachable } from "~/utils/types";
import {
  SENDOUQ_PAGE,
  SENDOUQ_PREPARING_PAGE,
  SENDOUQ_RULES_PAGE,
  SENDOU_INK_DISCORD_URL,
  navIconUrl,
  teamPage,
  userSubmittedImage,
} from "~/utils/urls";
import { GroupCard } from "../components/GroupCard";
import { matchEndedAtIndex } from "../core/match";
import { compareMatchToReportedScores } from "../core/match.server";
import type { ReportedWeaponForMerging } from "../core/reported-weapons.server";
import {
  mergeReportedWeapons,
  reportedWeaponsToArrayOfArrays,
} from "../core/reported-weapons.server";
import { calculateMatchSkills } from "../core/skills.server";
import {
  summarizeMaps,
  summarizePlayerResults,
} from "../core/summarizer.server";
import { FULL_GROUP_SIZE, USER_SKILLS_CACHE_KEY } from "../q-constants";
import { matchSchema } from "../q-schemas.server";
import { matchIdFromParams, winnersArrayToWinner } from "../q-utils";
import styles from "../q.css";
import { addDummySkill } from "../queries/addDummySkill.server";
import { addMapResults } from "../queries/addMapResults.server";
import { addPlayerResults } from "../queries/addPlayerResults.server";
import { addReportedWeapons } from "../queries/addReportedWeapons.server";
import { addSkills } from "../queries/addSkills.server";
import { createGroupFromPreviousGroup } from "../queries/createGroup.server";
import { deleteReporterWeaponsByMatchId } from "../queries/deleteReportedWeaponsByMatchId.server";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { findMatchById } from "../queries/findMatchById.server";
import { groupForMatch } from "../queries/groupForMatch.server";
import { reportScore } from "../queries/reportScore.server";
import { reportedWeaponsByMatchId } from "../queries/reportedWeaponsByMatchId.server";
import { setGroupAsInactive } from "../queries/setGroupAsInactive.server";

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

export const action = async ({ request, params }: ActionArgs) => {
  const matchId = matchIdFromParams(params);
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: matchSchema,
  });

  switch (data._action) {
    case "REPORT_SCORE": {
      const match = notFoundIfFalsy(findMatchById(matchId));
      if (match.isLocked) {
        return null;
      }

      validate(
        !data.adminReport || isMod(user),
        "Only mods can report scores as admin",
      );
      const members = [
        ...groupForMatch(match.alphaGroupId)!.members.map((m) => ({
          ...m,
          groupId: match.alphaGroupId,
        })),
        ...groupForMatch(match.bravoGroupId)!.members.map((m) => ({
          ...m,
          groupId: match.bravoGroupId,
        })),
      ];

      const groupMemberOfId = members.find((m) => m.id === user.id)?.groupId;
      invariant(
        groupMemberOfId || data.adminReport,
        "User is not a member of any group",
      );

      const winner = winnersArrayToWinner(data.winners);
      const winnerGroupId =
        winner === "ALPHA" ? match.alphaGroupId : match.bravoGroupId;
      const loserGroupId =
        winner === "ALPHA" ? match.bravoGroupId : match.alphaGroupId;

      // when admin reports match gets locked right away
      const compared = data.adminReport
        ? "SAME"
        : compareMatchToReportedScores({
            match,
            winners: data.winners,
            newReporterGroupId: groupMemberOfId!,
            previousReporterGroupId: match.reportedByUserId
              ? members.find((m) => m.id === match.reportedByUserId)!.groupId
              : undefined,
          });

      // same group reporting same score, probably by mistake
      if (compared === "DUPLICATE") {
        return null;
      }

      const matchIsBeingCanceled = data.winners.length === 0;

      const { newSkills, differences } =
        compared === "SAME" && !matchIsBeingCanceled
          ? calculateMatchSkills({
              groupMatchId: match.id,
              winner: groupForMatch(winnerGroupId)!.members.map((m) => m.id),
              loser: groupForMatch(loserGroupId)!.members.map((m) => m.id),
              winnerGroupId,
              loserGroupId,
            })
          : { newSkills: null, differences: null };

      const shouldLockMatchWithoutChangingRecords =
        compared === "SAME" && matchIsBeingCanceled;

      sql.transaction(() => {
        if (
          compared === "FIX_PREVIOUS" ||
          compared === "FIRST_REPORT" ||
          data.adminReport
        ) {
          reportScore({
            matchId,
            reportedByUserId: user.id,
            winners: data.winners,
          });
        }
        // own group gets set inactive
        if (groupMemberOfId) setGroupAsInactive(groupMemberOfId);
        // skills & map/player results only update after both teams have reported
        if (newSkills) {
          addMapResults(
            summarizeMaps({ match, members, winners: data.winners }),
          );
          addPlayerResults(
            summarizePlayerResults({ match, members, winners: data.winners }),
          );
          addSkills({
            skills: newSkills,
            differences,
            groupMatchId: match.id,
            oldMatchMemento: match.memento,
          });
          cache.delete(USER_SKILLS_CACHE_KEY);
        }
        if (shouldLockMatchWithoutChangingRecords) {
          addDummySkill(match.id);
        }
        // fix edge case where they 1) report score 2) report weapons 3) report score again, but with different amount of maps played
        if (compared === "FIX_PREVIOUS") {
          deleteReporterWeaponsByMatchId(matchId);
        }
        // admin reporting, just set both groups inactive
        if (data.adminReport) {
          setGroupAsInactive(match.alphaGroupId);
          setGroupAsInactive(match.bravoGroupId);
        }
      })();

      if (compared === "DIFFERENT") {
        return {
          error: matchIsBeingCanceled
            ? ("cant-cancel" as const)
            : ("different" as const),
        };
      }

      if (match.chatCode) {
        const type = (): NonNullable<ChatMessage["type"]> => {
          if (compared === "SAME") {
            return matchIsBeingCanceled
              ? "CANCEL_CONFIRMED"
              : "SCORE_CONFIRMED";
          }

          return matchIsBeingCanceled ? "CANCEL_REPORTED" : "SCORE_REPORTED";
        };

        NotificationService.notify({
          room: match.chatCode,
          type: type(),
          context: {
            name: user.discordName,
          },
        });
      }

      break;
    }
    case "LOOK_AGAIN": {
      const season = currentSeason(new Date());
      validate(season, "Season is not active");

      const previousGroup = groupForMatch(data.previousGroupId);
      validate(previousGroup, "Previous group not found");

      for (const member of previousGroup.members) {
        const currentGroup = findCurrentGroupByUserId(member.id);
        validate(!currentGroup, "Member is already in a group");
        if (member.id === user.id) {
          validate(
            member.role === "OWNER",
            "You are not the owner of the group",
          );
        }
      }

      createGroupFromPreviousGroup({
        previousGroupId: data.previousGroupId,
        members: previousGroup.members.map((m) => ({ id: m.id, role: m.role })),
      });

      throw redirect(SENDOUQ_PREPARING_PAGE);
    }
    case "REPORT_WEAPONS": {
      const match = notFoundIfFalsy(findMatchById(matchId));
      validate(match.reportedAt, "Match has not been reported yet");

      const oldReportedWeapons = reportedWeaponsByMatchId(matchId) ?? [];

      const mergedWeapons = mergeReportedWeapons({
        oldWeapons: oldReportedWeapons,
        newWeapons: data.weapons as (ReportedWeapon & {
          mapIndex: number;
          groupMatchMapId: number;
        })[],
      });

      sql.transaction(() => {
        deleteReporterWeaponsByMatchId(matchId);
        addReportedWeapons(mergedWeapons);
      })();

      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await getUserId(request);
  const matchId = matchIdFromParams(params);
  const match = notFoundIfFalsy(findMatchById(matchId));

  const groupAlpha = groupForMatch(match.alphaGroupId);
  invariant(groupAlpha, "Group alpha not found");
  const groupBravo = groupForMatch(match.bravoGroupId);
  invariant(groupBravo, "Group bravo not found");

  const censoredGroupAlpha = { ...groupAlpha, chatCode: undefined };
  const censoredGroupBravo = { ...groupBravo, chatCode: undefined };
  const censoredMatch = { ...match, chatCode: undefined };

  const isTeamAlphaMember = groupAlpha.members.some((m) => m.id === user?.id);
  const isTeamBravoMember = groupBravo.members.some((m) => m.id === user?.id);
  const canAccessMatchChat =
    isTeamAlphaMember || isTeamBravoMember || isMod(user);
  const canPostChatMessages = isTeamAlphaMember || isTeamBravoMember;

  const groupChatCode = () => {
    if (isTeamAlphaMember) return groupAlpha.chatCode;
    if (isTeamBravoMember) return groupBravo.chatCode;

    return null;
  };

  const rawReportedWeapons = match.reportedAt
    ? reportedWeaponsByMatchId(matchId)
    : null;

  return {
    match: censoredMatch,
    matchChatCode: canAccessMatchChat ? match.chatCode : null,
    canPostChatMessages,
    groupChatCode: groupChatCode(),
    groupAlpha: censoredGroupAlpha,
    groupBravo: censoredGroupBravo,
    groupMemberOf: isTeamAlphaMember
      ? ("ALPHA" as const)
      : isTeamBravoMember
      ? ("BRAVO" as const)
      : null,
    reportedWeapons: match.reportedAt
      ? reportedWeaponsToArrayOfArrays({
          groupAlpha,
          groupBravo,
          mapList: match.mapList,
          reportedWeapons: rawReportedWeapons,
        })
      : null,
    rawReportedWeapons,
  };
};

// xxx: check what happens when reporting score+weapons and autoupdate via ws causes the inputs to change
// xxx: when reporting score also show input to report your own weapon
export default function QMatchPage() {
  const user = useUser();
  const isMounted = useIsMounted();
  const { i18n } = useTranslation();
  const data = useLoaderData<typeof loader>();
  const [showWeaponsForm, setShowWeaponsForm] = React.useState(false);
  const submitScoreFetcher = useFetcher<typeof action>();
  const cancelScoreFetcher = useFetcher<typeof action>();

  React.useEffect(() => {
    setShowWeaponsForm(false);
  }, [data.reportedWeapons, data.match.id]);

  const ownMember =
    data.groupAlpha.members.find((m) => m.id === user?.id) ??
    data.groupBravo.members.find((m) => m.id === user?.id);
  const canReportScore = Boolean(
    !data.match.isLocked && (ownMember || isMod(user)),
  );

  const ownGroup = data.groupAlpha.members.some((m) => m.id === user?.id)
    ? data.groupAlpha
    : data.groupBravo.members.some((m) => m.id === user?.id)
    ? data.groupBravo
    : null;

  const ownTeamReported = Boolean(
    data.match.reportedByUserId &&
      ownGroup?.members.some((m) => m.id === data.match.reportedByUserId),
  );
  const showScore =
    data.match.isLocked || (data.match.reportedByUserId && ownGroup);

  const poolCode = () => {
    const stringId = String(data.match.id);
    const lastDigit = stringId[stringId.length - 1];

    return `SQ${lastDigit}`;
  };

  const chatUsers = React.useMemo(() => {
    return Object.fromEntries(
      [...data.groupAlpha.members, ...data.groupBravo.members].map((m) => [
        m.id,
        m,
      ]),
    );
  }, [data]);

  const chatRooms = React.useMemo(() => {
    return [
      data.matchChatCode ? { code: data.matchChatCode, label: "Match" } : null,
      data.groupChatCode ? { code: data.groupChatCode, label: "Group" } : null,
    ].filter(Boolean) as ChatProps["rooms"];
  }, [data.matchChatCode, data.groupChatCode]);

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
                },
              )
            : // reserve place
              "0/0/0 0:00"}
        </div>
      </div>
      {showScore ? (
        <>
          <Score
            reportedAt={data.match.reportedAt!}
            ownTeamReported={ownTeamReported}
          />
          {ownGroup && ownMember && data.match.reportedAt ? (
            <AfterMatchActions
              ownGroupId={ownGroup.id}
              role={ownMember.role}
              reportedAt={data.match.reportedAt}
              showWeaponsForm={showWeaponsForm}
              setShowWeaponsForm={setShowWeaponsForm}
              key={data.reportedWeapons?.join("")}
            />
          ) : null}
        </>
      ) : null}
      {!showWeaponsForm ? (
        <>
          <div
            className={clsx("q-match__teams-container", {
              "with-chat": data.matchChatCode || data.groupChatCode,
            })}
          >
            {[data.groupAlpha, data.groupBravo].map((group, i) => {
              const side = i === 0 ? "ALPHA" : "BRAVO";

              return (
                <div className="stack sm text-lighter text-xs" key={group.id}>
                  <div className="stack horizontal justify-between items-center">
                    {i === 0 ? "Alpha" : "Bravo"}
                    {group.team ? (
                      <Link
                        to={teamPage(group.team.customUrl)}
                        className="stack horizontal items-center xs font-bold"
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
                  </div>
                  <GroupCard
                    group={group}
                    displayOnly
                    hideVc={data.match.isLocked || data.groupMemberOf !== side}
                    hideWeapons={data.match.isLocked}
                  />
                </div>
              );
            })}
            {chatRooms.length > 0 ? (
              <ConnectedChat
                users={chatUsers}
                rooms={chatRooms}
                disabled={!data.canPostChatMessages}
              />
            ) : null}
          </div>
          {!data.match.isLocked && (ownMember || isMod(user)) ? (
            <div>
              <div className="stack horizontal justify-between">
                <Link to={SENDOUQ_RULES_PAGE} className="text-xxs font-bold">
                  Read the rules
                </Link>
                {canReportScore && !data.match.isLocked ? (
                  <FormWithConfirm
                    dialogHeading="Cancel match? (Check rules)"
                    fields={[
                      ["_action", "REPORT_SCORE"],
                      ["winners", "[]"],
                    ]}
                    deleteButtonText="Cancel"
                    cancelButtonText="Nevermind"
                    fetcher={cancelScoreFetcher}
                  >
                    <Button
                      className="build__small-text"
                      variant="minimal-destructive"
                      size="tiny"
                      type="submit"
                      disabled={
                        ownTeamReported && !data.match.mapList[0].winnerGroupId
                      }
                    >
                      Cancel match
                    </Button>
                  </FormWithConfirm>
                ) : null}
              </div>
              <div className="q-match__join-discord-section">
                If needed, contact your opponent on the <b>#match-meetup</b>{" "}
                channel of the sendou.ink Discord:{" "}
                <a
                  href={SENDOU_INK_DISCORD_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {SENDOU_INK_DISCORD_URL}
                </a>
                . Alpha team hosts. Password should be{" "}
                <span className="q-match__join-discord-section__highlighted">
                  {resolveRoomPass(data.match.id)}
                </span>
                . Pool code is{" "}
                <span className="q-match__join-discord-section__highlighted">
                  {poolCode()}
                </span>
              </div>
            </div>
          ) : null}
          {cancelScoreFetcher.data?.error === "cant-cancel" ? (
            <div className="text-xs text-warning font-semi-bold text-center">
              Can&apos;t cancel since opponent has already reported score for
              this match. See dispute instructions at the top of the page.
            </div>
          ) : null}
          <MapList
            key={data.match.id}
            canReportScore={canReportScore}
            isResubmission={ownTeamReported}
            fetcher={submitScoreFetcher}
          />
          {submitScoreFetcher.data?.error === "different" ? (
            <div className="text-xs text-warning font-semi-bold text-center">
              You reported different results than your opponent. Double check
              the above is correct and otherwise see dispute instructions at the
              top of the page.
            </div>
          ) : null}
        </>
      ) : null}
    </Main>
  );
}

function Score({
  reportedAt,
  ownTeamReported,
}: {
  reportedAt: number;
  ownTeamReported: boolean;
}) {
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
    [0, 0],
  );

  if (score[0] === 0 && score[1] === 0) {
    return (
      <div className="stack items-center line-height-tight">
        <div className="text-sm font-bold text-warning">Match canceled</div>
        {!data.match.isLocked ? (
          <div className="text-xs text-lighter stack xs items-center text-center">
            {!ownTeamReported ? (
              <DisputePopover />
            ) : (
              "Pending other team's confirmation"
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack items-center line-height-tight">
      <div className="text-lg font-bold">{score.join(" - ")}</div>
      {data.match.isLocked ? (
        <div
          className={clsx("text-xs text-lighter", { invisible: !isMounted })}
        >
          Reported by {reporter?.discordName ?? <b>admin</b>} at{" "}
          {isMounted
            ? databaseTimestampToDate(reportedAt).toLocaleString(
                i18n.language,
                {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                },
              )
            : ""}
        </div>
      ) : (
        <div className="text-xs text-lighter stack xs items-center text-center">
          SP will be adjusted after both teams report the same results{" "}
          {!ownTeamReported ? <DisputePopover /> : null}
        </div>
      )}
    </div>
  );
}

function DisputePopover() {
  return (
    <Popover buttonChildren="Dispute?" containerClassName="text-main-forced">
      <p>
        If there is a mistake contact the other team to correct it on their
        side. Score can be freely rereported till both teams report the same
        result.
      </p>
      <p className="mt-2">
        If there is a problem talking with the other team, contact a mod on the
        sendou.ink Discord helpdesk. Provide screenshots that show the correct
        score.
      </p>
    </Popover>
  );
}

function AfterMatchActions({
  ownGroupId,
  role,
  reportedAt,
  showWeaponsForm,
  setShowWeaponsForm,
}: {
  ownGroupId: number;
  role: GroupMember["role"];
  reportedAt: number;
  showWeaponsForm: boolean;
  setShowWeaponsForm: (show: boolean) => void;
}) {
  const data = useLoaderData<typeof loader>();
  const lookAgainFetcher = useFetcher();

  const wasReportedInTheLastHour =
    databaseTimestampToDate(reportedAt).getTime() > Date.now() - 3600 * 1000;

  const season = currentSeason(new Date());
  const showLookAgain = role === "OWNER" && wasReportedInTheLastHour && season;

  const wasReportedInTheLastWeek =
    databaseTimestampToDate(reportedAt).getTime() >
    Date.now() - 7 * 24 * 3600 * 1000;
  const showWeaponsFormButton =
    wasReportedInTheLastWeek && data.match.mapList[0].winnerGroupId;

  return (
    <div className="stack lg">
      <lookAgainFetcher.Form
        method="post"
        className="stack horizontal justify-center md flex-wrap"
      >
        <input type="hidden" name="previousGroupId" value={ownGroupId} />
        {showLookAgain ? (
          <SubmitButton
            icon={<RefreshArrowsIcon />}
            state={lookAgainFetcher.state}
            _action="LOOK_AGAIN"
          >
            Look again with same group
          </SubmitButton>
        ) : null}
        {showWeaponsFormButton ? (
          <Button
            icon={<ArchiveBoxIcon />}
            onClick={() => setShowWeaponsForm(!showWeaponsForm)}
            variant={showWeaponsForm ? "destructive" : undefined}
          >
            {showWeaponsForm ? "Stop reporting weapons" : "Report used weapons"}
          </Button>
        ) : null}
      </lookAgainFetcher.Form>
      {showWeaponsForm ? <ReportWeaponsForm /> : null}
    </div>
  );
}

function ReportWeaponsForm() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const weaponsFetcher = useFetcher();

  const [weaponsUsage, setWeaponsUsage] = React.useState<
    ReportedWeaponForMerging[]
  >(data.rawReportedWeapons ?? []);
  const [reportingMode, setReportingMode] = React.useState<
    "ALL" | "MYSELF" | "MY_TEAM"
  >("MYSELF");

  const playedMaps = data.match.mapList.filter((m) => m.winnerGroupId);
  const winners = playedMaps.map((m) =>
    m.winnerGroupId === data.match.alphaGroupId ? "ALPHA" : "BRAVO",
  );

  const handleCopyWeaponsFromPreviousMap =
    ({
      mapIndex,
      groupMatchMapId,
    }: {
      mapIndex: number;
      groupMatchMapId: number;
    }) =>
    () => {
      setWeaponsUsage((val) => {
        const previousWeapons = val.filter(
          (reportedWeapon) => reportedWeapon.mapIndex === mapIndex - 1,
        );

        return [
          ...val.filter(
            (reportedWeapon) => reportedWeapon.mapIndex !== mapIndex,
          ),
          ...previousWeapons.map((reportedWeapon) => ({
            ...reportedWeapon,
            mapIndex,
            groupMatchMapId,
          })),
        ];
      });
    };

  const playersToReport = () => {
    const allPlayers = [...data.groupAlpha.members, ...data.groupBravo.members];

    switch (reportingMode) {
      case "ALL": {
        return allPlayers;
      }
      case "MYSELF": {
        const me = allPlayers.find((m) => m.id === user?.id);
        invariant(me, "User not found");

        return [me];
      }
      case "MY_TEAM": {
        return data.groupMemberOf === "ALPHA"
          ? data.groupAlpha.members
          : data.groupBravo.members;
      }
      default:
        assertUnreachable(reportingMode);
    }
  };

  return (
    <weaponsFetcher.Form method="post" className="stack lg">
      <input
        type="hidden"
        name="weapons"
        value={JSON.stringify(weaponsUsage)}
      />
      <div className="stack horizontal sm justify-between w-max mx-auto">
        <h3 className="text-md">Who to report?</h3>
        <label className="stack horizontal xs items-center mb-0">
          Me
          <input
            type="radio"
            checked={reportingMode === "MYSELF"}
            onChange={() => setReportingMode("MYSELF")}
          />
        </label>
        <label className="stack horizontal xs items-center mb-0">
          My team
          <input
            type="radio"
            checked={reportingMode === "MY_TEAM"}
            onChange={() => setReportingMode("MY_TEAM")}
          />
        </label>
        <label className="stack horizontal xs items-center mb-0">
          Everyone
          <input
            type="radio"
            checked={reportingMode === "ALL"}
            onChange={() => setReportingMode("ALL")}
          />
        </label>
      </div>
      <div className="stack md mx-auto">
        {playedMaps.map((map, i) => {
          const groupMatchMapId = map.id;

          return (
            <div key={map.stageId} className="stack md">
              <MapListMap
                canReportScore={false}
                i={i}
                map={map}
                winners={winners}
              />
              {i !== 0 ? (
                <Button
                  size="tiny"
                  variant="outlined"
                  className="self-center"
                  onClick={handleCopyWeaponsFromPreviousMap({
                    groupMatchMapId,
                    mapIndex: i,
                  })}
                >
                  Copy weapons from above map
                </Button>
              ) : null}
              <div className="stack sm">
                {playersToReport().map((member, j) => {
                  const weaponSplId =
                    weaponsUsage.find(
                      (w) =>
                        w.groupMatchMapId === groupMatchMapId &&
                        w.userId === member.id,
                    )?.weaponSplId ?? null;

                  return (
                    <React.Fragment key={member.id}>
                      {j === 0 && reportingMode === "ALL" ? (
                        <Divider className="text-sm">Alpha</Divider>
                      ) : null}
                      {j === FULL_GROUP_SIZE && reportingMode === "ALL" ? (
                        <Divider className="text-sm">Bravo</Divider>
                      ) : null}
                      <div
                        key={member.id}
                        className="stack horizontal sm justify-between items-center flex-wrap"
                      >
                        <div className="q-match__report__user-name-container">
                          <Avatar user={member} size="xxs" />{" "}
                          {member.inGameName ? (
                            <>
                              <span className="text-lighter font-semi-bold">
                                IGN:
                              </span>{" "}
                              {inGameNameWithoutDiscriminator(
                                member.inGameName,
                              )}
                            </>
                          ) : (
                            member.discordName
                          )}
                        </div>
                        <div className="stack horizontal sm items-center">
                          <WeaponImage
                            weaponSplId={weaponSplId ?? 0}
                            variant="badge"
                            width={32}
                            className={clsx("ml-auto", {
                              invisible: typeof weaponSplId !== "number",
                            })}
                          />
                          <WeaponCombobox
                            inputName="weapon"
                            value={weaponSplId}
                            onChange={(weapon) => {
                              if (!weapon) return;

                              setWeaponsUsage((val) => {
                                const result = val.filter(
                                  (reportedWeapon) =>
                                    reportedWeapon.groupMatchMapId !==
                                      groupMatchMapId ||
                                    reportedWeapon.userId !== member.id,
                                );

                                result.push({
                                  weaponSplId: Number(
                                    weapon.value,
                                  ) as MainWeaponId,
                                  mapIndex: i,
                                  groupMatchMapId,
                                  userId: member.id,
                                });

                                return result;
                              });
                            }}
                          />
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {weaponsUsage.flat().some((val) => val === null) ? (
        <div className="text-sm text-center text-warning font-semi-bold">
          Report all weapons to submit
        </div>
      ) : (
        <div className="stack items-center">
          <SubmitButton _action="REPORT_WEAPONS">Report weapons</SubmitButton>
        </div>
      )}
    </weaponsFetcher.Form>
  );
}

function MapList({
  canReportScore,
  isResubmission,
  fetcher,
}: {
  canReportScore: boolean;
  isResubmission: boolean;
  fetcher: FetcherWithComponents<any>;
}) {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const [adminToggleChecked, setAdminToggleChecked] = React.useState(false);

  const previouslyReportedWinners = isResubmission
    ? data.match.mapList
        .filter((m) => m.winnerGroupId)
        .map((m) =>
          m.winnerGroupId === data.groupAlpha.id ? "ALPHA" : "BRAVO",
        )
    : [];
  const [winners, setWinners] = React.useState<("ALPHA" | "BRAVO")[]>(
    previouslyReportedWinners,
  );

  const newScoresAreDifferent =
    !previouslyReportedWinners ||
    previouslyReportedWinners.length !== winners.length ||
    previouslyReportedWinners.some((w, i) => w !== winners[i]);
  const scoreCanBeReported =
    Boolean(matchEndedAtIndex(winners)) &&
    !data.match.isLocked &&
    newScoresAreDifferent;

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="winners" value={JSON.stringify(winners)} />
      <Flipper flipKey={winners.join("")}>
        <div className="stack md w-max mx-auto">
          {data.match.mapList.map((map, i) => {
            return (
              <MapListMap
                key={map.stageId}
                canReportScore={canReportScore}
                i={i}
                map={map}
                winners={winners}
                setWinners={setWinners}
                weapons={data.reportedWeapons?.[i]}
              />
            );
          })}
        </div>
      </Flipper>
      {scoreCanBeReported && isMod(user) ? (
        <div className="stack sm horizontal items-center text-sm font-semi-bold">
          <Toggle
            name="adminReport"
            checked={adminToggleChecked}
            setChecked={setAdminToggleChecked}
          />
          Report as admin
        </div>
      ) : null}
      {scoreCanBeReported ? (
        <div className="stack md items-center mt-4">
          <ResultSummary winners={winners} />
          <SubmitButton _action="REPORT_SCORE" state={fetcher.state}>
            {isResubmission ? "Submit adjusted scores" : "Submit scores"}
          </SubmitButton>
        </div>
      ) : null}
    </fetcher.Form>
  );
}

function MapListMap({
  i,
  map,
  winners,
  setWinners,
  canReportScore,
  weapons,
}: {
  i: number;
  map: Unpacked<SerializeFrom<typeof loader>["match"]["mapList"]>;
  winners: ("ALPHA" | "BRAVO")[];
  setWinners?: (winners: ("ALPHA" | "BRAVO")[]) => void;
  canReportScore: boolean;
  weapons?: (MainWeaponId | null)[] | null;
}) {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["game-misc", "tournament"]);

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

    setWinners?.(newWinners);
  };

  const scoreCanBeReported =
    Boolean(matchEndedAtIndex(winners)) && !data.match.isLocked;
  const showWinnerReportRow = (i: number) => {
    if (!canReportScore) return false;

    if (i === 0) return true;

    if (scoreCanBeReported && !winners[i]) return false;

    const previous = winners[i - 1];
    return Boolean(previous);
  };

  const winningInfoText = (winnerId: number | null) => {
    if (!data.match.isLocked) return null;

    if (!winnerId)
      return (
        <>
          • <i>Unplayed</i>
        </>
      );

    const winner = winnerId === data.match.alphaGroupId ? "Alpha" : "Bravo";

    return <>• {winner} won</>;
  };

  const relativeSideText = (side: "ALPHA" | "BRAVO") => {
    if (!data.groupMemberOf) return "";

    return data.groupMemberOf === side ? " (us)" : " (them)";
  };

  return (
    <div key={map.stageId} className="stack xs">
      <Flipped flipId={map.stageId}>
        <div className="stack sm horizontal items-center">
          <StageImage stageId={map.stageId} width={64} className="rounded-sm" />
          <div>
            <div className="text-sm stack horizontal xs items-center">
              {i + 1}) <ModeImage mode={map.mode} size={18} />{" "}
              {t(`game-misc:STAGE_${map.stageId}`)}
            </div>
            <div className="text-lighter text-xs">
              {pickInfo(map.source)} {winningInfoText(map.winnerGroupId)}
            </div>
          </div>
        </div>
      </Flipped>
      {weapons && map.winnerGroupId ? (
        <div className="stack sm horizontal">
          {weapons.map((weaponSplId, i) => {
            return (
              <React.Fragment key={weaponSplId}>
                {weaponSplId ? (
                  <WeaponImage
                    weaponSplId={weaponSplId}
                    size={30}
                    variant="badge"
                  />
                ) : (
                  <div className="w-4 font-semi-bold stack items-center justify-center">
                    ?
                  </div>
                )}
                {i === 3 ? <div className="w-4" /> : null}
              </React.Fragment>
            );
          })}
        </div>
      ) : null}
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
            <label className="mb-0 text-theme-secondary">Winner</label>
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
                {`Alpha${relativeSideText("ALPHA")}`}
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
                {`Bravo${relativeSideText("BRAVO")}`}
              </label>
            </div>
          </div>
        </Flipped>
      ) : null}
    </div>
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
    [0, 0],
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
