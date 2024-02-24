import type { SerializeFrom } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Image } from "~/components/Image";
import { NewTabs } from "~/components/NewTabs";
import { SubmitButton } from "~/components/SubmitButton";
import { useUser } from "~/features/auth/core/user";
import { Chat, useChat } from "~/features/chat/components/Chat";
import { useTournament } from "~/features/tournament/routes/to.$id";
import { useIsMounted } from "~/hooks/useIsMounted";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import { databaseTimestampToDate } from "~/utils/dates";
import type { Unpacked } from "~/utils/types";
import { modeImageUrl, stageImageUrl } from "~/utils/urls";
import { type TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import {
  mapCountPlayedInSetWithCertainty,
  matchIsLocked,
  resolveHostingTeam,
  resolveRoomPass,
} from "../tournament-bracket-utils";
import { ScoreReporterRosters } from "./ScoreReporterRosters";
import type { TournamentDataTeam } from "../core/Tournament.server";

export type Result = Unpacked<
  SerializeFrom<TournamentMatchLoaderData>["results"]
>;

// TODO: rename (since it now contains Chat as well)
export function ScoreReporter({
  teams,
  currentStageWithMode,
  modes,
  selectedResultIndex,
  setSelectedResultIndex,
  result,
  type,
}: {
  teams: [TournamentDataTeam, TournamentDataTeam];
  result?: Result;
  currentStageWithMode: TournamentMapListMap;
  modes: ModeShort[];
  selectedResultIndex?: number;
  // if this is set it means the component is being used in presentation manner
  setSelectedResultIndex?: (index: number) => void;
  type: "EDIT" | "OTHER";
}) {
  const { t } = useTranslation(["tournament"]);
  const isMounted = useIsMounted();
  const user = useUser();
  const tournament = useTournament();
  const data = useLoaderData<TournamentMatchLoaderData>();

  const scoreOne = data.match.opponentOne?.score ?? 0;
  const scoreTwo = data.match.opponentTwo?.score ?? 0;

  const currentPosition = scoreOne + scoreTwo;

  const presentational = Boolean(setSelectedResultIndex);

  const showFullInfos = !presentational && type === "EDIT";

  const isMemberOfTeamParticipating = data.match.players.some(
    (p) => p.id === user?.id,
  );

  const roundInfos = [
    showFullInfos ? (
      <>
        {t("tournament:match.hosts", {
          teamName: resolveHostingTeam(teams).name,
        })}
      </>
    ) : null,
    showFullInfos ? (
      <>
        {t("tournament:match.pass")}{" "}
        <span className="text-theme font-bold" data-testid="room-pass">
          {resolveRoomPass(data.match.id)}
        </span>
      </>
    ) : null,
    showFullInfos ? (
      <span>
        {t("tournament:match.pool")}{" "}
        {
          tournament.resolvePoolCode({
            hostingTeamId: resolveHostingTeam(teams).id,
          }).prefix
        }
        <span className="text-theme font-bold">
          {
            tournament.resolvePoolCode({
              hostingTeamId: resolveHostingTeam(teams).id,
            }).lastDigit
          }
        </span>
      </span>
    ) : null,
    <>
      {t("tournament:match.score", {
        scoreOne,
        scoreTwo,
        bestOf: data.match.bestOf,
      })}
    </>,
  ];

  return (
    <div className="tournament-bracket__during-match-actions">
      <FancyStageBanner
        stage={currentStageWithMode}
        infos={roundInfos}
        teams={teams}
        matchIsLocked={matchIsLocked({
          matchId: data.match.id,
          scores: [scoreOne, scoreTwo],
          tournament,
        })}
      >
        {currentPosition > 0 &&
          !presentational &&
          type === "EDIT" &&
          (tournament.isOrganizer(user) || isMemberOfTeamParticipating) && (
            <Form method="post">
              <input
                type="hidden"
                name="position"
                value={currentPosition - 1}
              />
              <div className="tournament-bracket__stage-banner__bottom-bar">
                <SubmitButton
                  _action="UNDO_REPORT_SCORE"
                  className="tournament-bracket__stage-banner__undo-button"
                  testId="undo-score-button"
                >
                  {t("tournament:match.action.undoLastScore")}
                </SubmitButton>
              </div>
            </Form>
          )}
        {tournament.isOrganizer(user) &&
          tournament.matchCanBeReopened(data.match.id) &&
          presentational && (
            <Form method="post">
              <div className="tournament-bracket__stage-banner__bottom-bar">
                <SubmitButton
                  _action="REOPEN_MATCH"
                  className="tournament-bracket__stage-banner__undo-button"
                  testId="reopen-match-button"
                >
                  {t("tournament:match.action.reopenMatch")}
                </SubmitButton>
              </div>
            </Form>
          )}
      </FancyStageBanner>
      <ModeProgressIndicator
        modes={modes}
        scores={[scoreOne, scoreTwo]}
        bestOf={data.match.bestOf}
        selectedResultIndex={selectedResultIndex}
        setSelectedResultIndex={setSelectedResultIndex}
      />
      {type === "EDIT" || presentational ? (
        <MatchActionSectionTabs
          presentational={presentational}
          scores={[scoreOne, scoreTwo]}
          currentStageWithMode={currentStageWithMode}
          teams={teams}
          result={result}
        />
      ) : null}
      {result ? (
        <div
          className={clsx("text-center text-xs text-lighter", {
            invisible: !isMounted,
          })}
          data-testid="report-timestamp"
        >
          {isMounted
            ? databaseTimestampToDate(result.createdAt).toLocaleString()
            : "t"}
        </div>
      ) : null}
    </div>
  );
}

function FancyStageBanner({
  stage,
  infos,
  children,
  teams,
  matchIsLocked,
}: {
  stage: TournamentMapListMap;
  infos?: (JSX.Element | null)[];
  children?: React.ReactNode;
  teams: [TournamentDataTeam, TournamentDataTeam];
  matchIsLocked: boolean;
}) {
  const { t } = useTranslation(["game-misc", "tournament"]);

  const stageNameToBannerImageUrl = (stageId: StageId) => {
    return stageImageUrl(stageId) + ".png";
  };

  const style = {
    "--_tournament-bg-url": `url("${stageNameToBannerImageUrl(
      stage.stageId,
    )}")`,
  };

  const pickInfoText = () => {
    if (stage.source === teams[0].id)
      return t("tournament:pickInfo.team", { number: 1 });
    if (stage.source === teams[1].id)
      return t("tournament:pickInfo.team", { number: 2 });
    if (stage.source === "TIEBREAKER")
      return t("tournament:pickInfo.tiebreaker");
    if (stage.source === "BOTH") return t("tournament:pickInfo.both");
    if (stage.source === "DEFAULT") return t("tournament:pickInfo.default");

    console.error(`Unknown source: ${String(stage.source)}`);
    return "";
  };

  return (
    <>
      {matchIsLocked ? (
        <div className="tournament-bracket__locked-banner">
          <div className="stack sm items-center">
            <div className="text-lg text-center font-bold">
              Match locked to be casted
            </div>
            <div>Please wait for staff to unlock</div>
          </div>
        </div>
      ) : (
        <div
          className={clsx("tournament-bracket__stage-banner", {
            rounded: !infos,
          })}
          style={style}
          data-testid="stage-banner"
        >
          <div className="tournament-bracket__stage-banner__top-bar">
            <h4 className="tournament-bracket__stage-banner__top-bar__header">
              <Image
                className="tournament-bracket__stage-banner__top-bar__mode-image"
                path={modeImageUrl(stage.mode)}
                alt=""
                width={24}
              />
              <span className="tournament-bracket__stage-banner__top-bar__map-text-small">
                {t(`game-misc:MODE_SHORT_${stage.mode}`)}{" "}
                {t(`game-misc:STAGE_${stage.stageId}`)}
              </span>
              <span className="tournament-bracket__stage-banner__top-bar__map-text-big">
                {t(`game-misc:MODE_LONG_${stage.mode}`)} on{" "}
                {t(`game-misc:STAGE_${stage.stageId}`)}
              </span>
            </h4>
            <h4>{pickInfoText()}</h4>
          </div>
          {children}
        </div>
      )}
      {infos && (
        <div className="tournament-bracket__infos">
          {infos.filter(Boolean).map((info, i) => (
            <div key={i}>{info}</div>
          ))}
        </div>
      )}
    </>
  );
}

function ModeProgressIndicator({
  modes,
  scores,
  bestOf,
  selectedResultIndex,
  setSelectedResultIndex,
}: {
  modes: ModeShort[];
  scores: [number, number];
  bestOf: number;
  selectedResultIndex?: number;
  setSelectedResultIndex?: (index: number) => void;
}) {
  const data = useLoaderData<TournamentMatchLoaderData>();
  const { t } = useTranslation(["game-misc"]);

  const maxIndexThatWillBePlayedForSure =
    mapCountPlayedInSetWithCertainty({ bestOf, scores }) - 1;

  // TODO: this should be button when we click on it
  return (
    <div className="tournament-bracket__mode-progress">
      {modes.map((mode, i) => {
        return (
          <Image
            containerClassName={clsx(
              "tournament-bracket__mode-progress__image",
              {
                "tournament-bracket__mode-progress__image__notable":
                  i <= maxIndexThatWillBePlayedForSure,
                "tournament-bracket__mode-progress__image__team-one-win":
                  data.results[i] &&
                  data.results[i].winnerTeamId === data.match.opponentOne?.id,
                "tournament-bracket__mode-progress__image__team-two-win":
                  data.results[i] &&
                  data.results[i].winnerTeamId === data.match.opponentTwo?.id,
                "tournament-bracket__mode-progress__image__selected":
                  i === selectedResultIndex,
                "cursor-pointer": Boolean(setSelectedResultIndex),
              },
            )}
            key={i}
            path={modeImageUrl(mode)}
            height={20}
            width={20}
            alt={t(`game-misc:MODE_LONG_${mode}`)}
            title={t(`game-misc:MODE_LONG_${mode}`)}
            onClick={() => setSelectedResultIndex?.(i)}
          />
        );
      })}
    </div>
  );
}

function MatchActionSectionTabs({
  presentational,
  scores,
  currentStageWithMode,
  teams,
  result,
}: {
  presentational?: boolean;
  scores: [number, number];
  currentStageWithMode: TournamentMapListMap;
  teams: [TournamentDataTeam, TournamentDataTeam];
  result?: Result;
}) {
  const user = useUser();
  const tournament = useTournament();
  const data = useLoaderData<TournamentMatchLoaderData>();
  const [_unseenMessages, setUnseenMessages] = React.useState(0);
  const [chatVisible, setChatVisible] = React.useState(false);

  const chatUsers = React.useMemo(() => {
    return Object.fromEntries(
      [
        ...data.match.players.map((p) => ({ ...p, title: undefined })),
        ...tournament.ctx.staff.map((s) => ({
          ...s,
          title: s.role === "STREAMER" ? "Stream" : "TO",
        })),
        {
          ...tournament.ctx.author,
          title: "TO",
        },
      ].map((p) => [p.id, p]),
    );
  }, [data, tournament]);

  const showChat =
    !tournament.ctx.isFinalized &&
    data.match.chatCode &&
    (data.match.players.some((p) => p.id === user?.id) ||
      tournament.isOrganizerOrStreamer(user));

  const rooms = React.useMemo(() => {
    return showChat && data.match.chatCode
      ? [
          {
            code: data.match.chatCode,
            label: "Match",
          },
        ]
      : [];
  }, [showChat, data.match.chatCode]);

  const onNewMessage = React.useCallback(() => {
    setUnseenMessages((msg) => msg + 1);
  }, []);

  const chat = useChat({ rooms, onNewMessage });

  const onChatMount = React.useCallback(() => {
    setChatVisible(true);
  }, []);

  const onChatUnmount = React.useCallback(() => {
    setChatVisible(false);
    setUnseenMessages(0);
  }, []);

  const unseenMessages = chatVisible ? 0 : _unseenMessages;

  const currentPosition = scores[0] + scores[1];

  return (
    <ActionSectionWrapper topPadded={!showChat}>
      <NewTabs
        tabs={[
          {
            label: "Chat",
            number: unseenMessages,
            hidden: !showChat,
          },
          {
            label: presentational ? "Score" : "Report score",
          },
        ]}
        disappearing
        content={[
          {
            key: "chat",
            hidden: !showChat,
            element: (
              <>
                {showChat ? (
                  <Chat
                    rooms={rooms}
                    users={chatUsers}
                    className="w-full q__chat-container"
                    messagesContainerClassName="q__chat-messages-container"
                    chat={chat}
                    onMount={onChatMount}
                    onUnmount={onChatUnmount}
                    missingUserName="TO"
                  />
                ) : null}
              </>
            ),
          },
          {
            key: "report",
            unmount: false,
            element: (
              <ScoreReporterRosters
                // Without the key prop when switching to another match the winnerId is remembered
                // which causes "No winning team matching the id" error.
                // Switching the key props forces the component to remount.
                key={data.match.id}
                scores={scores}
                teams={teams}
                position={currentPosition}
                currentStageWithMode={currentStageWithMode}
                result={result}
                bestOf={data.match.bestOf}
                presentational={
                  !tournament.canReportScore({ matchId: data.match.id, user })
                }
              />
            ),
          },
        ]}
      />
    </ActionSectionWrapper>
  );
}

function ActionSectionWrapper({
  children,
  icon,
  topPadded,
  ...rest
}: {
  children: React.ReactNode;
  icon?: "warning" | "info" | "success" | "error";
  "justify-center"?: boolean;
  topPadded?: boolean;
}) {
  // todo: flex-dir: column on mobile
  const style = icon
    ? {
        "--action-section-icon-color": `var(--theme-${icon})`,
      }
    : undefined;
  return (
    <section className="tournament__action-section" style={style}>
      <div
        className={clsx("tournament__action-section__content", {
          "justify-center": rest["justify-center"],
          "pt-3": topPadded,
        })}
      >
        {children}
      </div>
    </section>
  );
}
