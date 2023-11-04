import {
  Form,
  useActionData,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import clsx from "clsx";
import { Image } from "~/components/Image";
import { SubmitButton } from "~/components/SubmitButton";
import { useTranslation } from "~/hooks/useTranslation";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import { modeImageUrl, stageImageUrl } from "~/utils/urls";
import { type TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import {
  HACKY_resolvePoolCode,
  mapCountPlayedInSetWithCertainty,
  resolveHostingTeam,
  resolveRoomPass,
} from "../tournament-bracket-utils";
import type { SerializeFrom } from "@remix-run/node";
import type { Unpacked } from "~/utils/types";
import type {
  TournamentLoaderTeam,
  TournamentLoaderData,
} from "~/features/tournament";
import { canAdminTournament } from "~/permissions";
import { useUser } from "~/features/auth/core";
import { useIsMounted } from "~/hooks/useIsMounted";
import { databaseTimestampToDate } from "~/utils/dates";
import { NewTabs } from "~/components/NewTabs";
import { ScoreReporterRosters } from "./ScoreReporterRosters";
import { Chat, useChat } from "~/features/chat/components/Chat";
import * as React from "react";

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
  teams: [TournamentLoaderTeam, TournamentLoaderTeam];
  result?: Result;
  currentStageWithMode: TournamentMapListMap;
  modes: ModeShort[];
  selectedResultIndex?: number;
  // if this is set it means the component is being used in presentation manner
  setSelectedResultIndex?: (index: number) => void;
  type: "EDIT" | "MEMBER" | "OTHER";
}) {
  const { t } = useTranslation(["tournament"]);
  const isMounted = useIsMounted();
  const actionData = useActionData<{ error?: "locked" }>();
  const user = useUser();
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const data = useLoaderData<TournamentMatchLoaderData>();

  const scoreOne = data.match.opponentOne?.score ?? 0;
  const scoreTwo = data.match.opponentTwo?.score ?? 0;

  const currentPosition = scoreOne + scoreTwo;

  const presentational = Boolean(setSelectedResultIndex);

  const showFullInfos =
    !presentational && (type === "EDIT" || type === "MEMBER");

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
        <span className="text-theme font-bold">
          {resolveRoomPass(data.match.id)}
        </span>
      </>
    ) : null,
    showFullInfos ? (
      <span>
        {t("tournament:match.pool")}{" "}
        {
          HACKY_resolvePoolCode({
            event: parentRouteData.tournament,
            matchId: data.match.id,
          }).prefix
        }
        <span className="text-theme font-bold">
          {
            HACKY_resolvePoolCode({
              event: parentRouteData.tournament,
              matchId: data.match.id,
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

  const matchIsLockedError = actionData?.error === "locked";

  return (
    <div className="tournament-bracket__during-match-actions">
      <FancyStageBanner
        stage={currentStageWithMode}
        infos={roundInfos}
        teams={teams}
      >
        {currentPosition > 0 && !presentational && type === "EDIT" && (
          <Form method="post">
            <input type="hidden" name="position" value={currentPosition - 1} />
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
        {canAdminTournament({ user, tournament: parentRouteData.tournament }) &&
          !parentRouteData.hasFinalized &&
          presentational &&
          !matchIsLockedError && (
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
        {matchIsLockedError && (
          <div className="tournament-bracket__stage-banner__bottom-bar">
            <SubmitButton
              _action="REOPEN_MATCH"
              className="tournament-bracket__stage-banner__undo-button"
              disabled
              testId="match-is-locked-button"
            >
              {t("tournament:match.action.matchIsLocked")}
            </SubmitButton>
          </div>
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
}: {
  stage: TournamentMapListMap;
  infos?: (JSX.Element | null)[];
  children?: React.ReactNode;
  teams: [TournamentLoaderTeam, TournamentLoaderTeam];
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
      <div
        className={clsx("tournament-bracket__stage-banner", {
          rounded: !infos,
        })}
        style={style as any}
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
                  data.results[i]!.winnerTeamId === data.match.opponentOne?.id,
                "tournament-bracket__mode-progress__image__team-two-win":
                  data.results[i] &&
                  data.results[i]!.winnerTeamId === data.match.opponentTwo?.id,
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
  teams: [TournamentLoaderTeam, TournamentLoaderTeam];
  result?: Result;
}) {
  const data = useLoaderData<TournamentMatchLoaderData>();
  const [_unseenMessages, setUnseenMessages] = React.useState(0);
  const [chatVisible, setChatVisible] = React.useState(false);

  const chatUsers = React.useMemo(() => {
    return Object.fromEntries(data.match.players.map((p) => [p.id, p]));
  }, [data]);

  const rooms = React.useMemo(() => {
    return data.match.chatCode
      ? [
          {
            code: data.match.chatCode,
            label: "Match",
          },
        ]
      : [];
  }, [data.match.chatCode]);

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
    <ActionSectionWrapper>
      <NewTabs
        tabs={[
          {
            label: "Chat",
            number: unseenMessages,
            hidden: !data.match.chatCode,
          },
          {
            label: presentational ? "Score" : "Report score",
          },
        ]}
        disappearing
        content={[
          {
            key: "chat",
            hidden: !data.match.chatCode,
            element: (
              <>
                {data.match.chatCode ? (
                  <Chat
                    rooms={rooms}
                    users={chatUsers}
                    className="w-full q__chat-container"
                    messagesContainerClassName="q__chat-messages-container"
                    onNewMessage={onNewMessage}
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
  ...rest
}: {
  children: React.ReactNode;
  icon?: "warning" | "info" | "success" | "error";
  "justify-center"?: boolean;
}) {
  // todo: flex-dir: column on mobile
  const style = icon
    ? {
        "--action-section-icon-color": `var(--theme-${icon})`,
      }
    : undefined;
  return (
    <section className="tournament__action-section" style={style as any}>
      <div
        className={clsx("tournament__action-section__content", {
          "justify-center": rest["justify-center"],
        })}
      >
        {children}
      </div>
    </section>
  );
}
