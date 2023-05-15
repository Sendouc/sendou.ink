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
import type { TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import {
  HACKY_resolvePoolCode,
  mapCountPlayedInSetWithCertainty,
  resolveHostingTeam,
  resolveRoomPass,
} from "../tournament-bracket-utils";
import { ScoreReporterRosters } from "./ScoreReporterRosters";
import type { SerializeFrom } from "@remix-run/node";
import type { Unpacked } from "~/utils/types";
import type {
  TournamentLoaderTeam,
  TournamentLoaderData,
} from "~/features/tournament";
import { canAdminTournament } from "~/permissions";
import { useUser } from "~/modules/auth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { databaseTimestampToDate } from "~/utils/dates";

export type Result = Unpacked<
  SerializeFrom<TournamentMatchLoaderData>["results"]
>;

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
  currentStageWithMode: TournamentMapListMap;
  modes: ModeShort[];
  selectedResultIndex?: number;
  // if this is set it means the component is being used in presentation manner
  setSelectedResultIndex?: (index: number) => void;
  result?: Result;
  type: "EDIT" | "MEMBER" | "OTHER";
}) {
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
        <b>{resolveHostingTeam(teams).name}</b> hosts
      </>
    ) : null,
    showFullInfos ? (
      <>
        Pass <b>{resolveRoomPass(data.match.id)}</b>
      </>
    ) : null,
    showFullInfos ? (
      <>
        Pool <b>{HACKY_resolvePoolCode(parentRouteData.event)}</b>
      </>
    ) : null,
    <>
      <b>
        {scoreOne}-{scoreTwo}
      </b>{" "}
      (Best of {data.match.bestOf})
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
              >
                Undo last score
              </SubmitButton>
            </div>
          </Form>
        )}
        {canAdminTournament({ user, event: parentRouteData.event }) &&
          presentational &&
          !matchIsLockedError && (
            <Form method="post">
              <div className="tournament-bracket__stage-banner__bottom-bar">
                <SubmitButton
                  _action="REOPEN_MATCH"
                  className="tournament-bracket__stage-banner__undo-button"
                >
                  Reopen match
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
            >
              Match is locked
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
        <ActionSectionWrapper>
          <ScoreReporterRosters
            // Without the key prop when switching to another match the winnerId is remembered
            // which causes "No winning team matching the id" error.
            // Switching the key props forces the component to remount.
            key={data.match.id}
            teams={teams}
            position={currentPosition}
            currentStageWithMode={currentStageWithMode}
            result={result}
          />
        </ActionSectionWrapper>
      ) : null}
      {result ? (
        <div
          className={clsx("text-center text-xs text-lighter", {
            invisible: !isMounted,
          })}
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
      stage.stageId
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
            {t(`game-misc:MODE_LONG_${stage.mode}`)} on{" "}
            {t(`game-misc:STAGE_${stage.stageId}`)}
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
              }
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

function ActionSectionWrapper({
  children,
  icon,
  ...rest
}: {
  children: React.ReactNode;
  icon?: "warning" | "info" | "success" | "error";
  "justify-center"?: boolean;
  "data-cy"?: string;
}) {
  // todo: flex-dir: column on mobile
  const style = icon
    ? {
        "--action-section-icon-color": `var(--theme-${icon})`,
      }
    : undefined;
  return (
    <section
      className="tournament__action-section"
      style={style as any}
      data-cy={rest["data-cy"]}
    >
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
