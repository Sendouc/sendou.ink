import { Form, useLoaderData, useOutletContext } from "@remix-run/react";
import clsx from "clsx";
import { Image } from "~/components/Image";
import { SubmitButton } from "~/components/SubmitButton";
import { useTranslation } from "~/hooks/useTranslation";
import type { StageId } from "~/modules/in-game-lists";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import { modeImageUrl } from "~/utils/urls";
import type {
  TournamentToolsLoaderData,
  TournamentToolsTeam,
} from "../routes/to.$id";
import type { TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import {
  HACKY_resolvePoolCode,
  resolveHostingTeam,
  resolveRoomPass,
} from "../tournament-utils";
import { ScoreReporterRosters } from "./ScoreReporterRosters";

// xxx: show igns in radios (fallback to discord name if ign is not set)
export function ScoreReporter({
  teams,
  currentStageWithMode,
}: {
  teams: [TournamentToolsTeam, TournamentToolsTeam];
  currentStageWithMode: TournamentMapListMap;
}) {
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
  const data = useLoaderData<TournamentMatchLoaderData>();

  const scoreOne = data.match.opponentOne?.score ?? 0;
  const scoreTwo = data.match.opponentTwo?.score ?? 0;

  const currentPosition = scoreOne + scoreTwo;

  const roundInfos = [
    <>
      <b>{resolveHostingTeam(teams).name}</b> hosts
    </>,
    <>
      Pass <b>{resolveRoomPass(data.match.id)}</b>
    </>,
    <>
      Pool <b>{HACKY_resolvePoolCode(parentRouteData.event)}</b>
    </>,
    <>
      <b>
        {scoreOne}-{scoreTwo}
      </b>{" "}
      (Best of {data.bestOf})
    </>,
  ];

  return (
    <div className="tournament-bracket__during-match-actions">
      <FancyStageBanner
        stage={currentStageWithMode}
        infos={roundInfos}
        teams={teams}
      >
        {currentPosition > 1 && (
          <Form method="post">
            <input type="hidden" name="_action" value="UNDO_REPORT_SCORE" />
            <input type="hidden" name="position" value={currentPosition - 1} />
            <div className="tournament-bracket__stage-banner__bottom-bar">
              <SubmitButton
                _action="UNDO_REPORT_SCORE"
                className="tournament-bracket__stage-banner__undo-button"
                loadingText="Undoing..."
              >
                Undo last score
              </SubmitButton>
            </div>
          </Form>
        )}
      </FancyStageBanner>
      <ActionSectionWrapper>
        <ScoreReporterRosters
          // Without the key prop when switching to another match the winnerId is remembered
          // which causes "No winning team matching the id" error.
          // Switching the key props forces the component to remount.
          key={data.match.id}
          teams={teams}
          matchId={data.match.id}
          position={currentPosition}
        />
      </ActionSectionWrapper>
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
  infos?: JSX.Element[];
  children?: React.ReactNode;
  teams: [TournamentToolsTeam, TournamentToolsTeam];
}) {
  const { t } = useTranslation(["game-misc", "tournament"]);

  // xxx: dynamic stage img
  const stageNameToBannerImageUrl = (_stageId: StageId) => {
    return "https://raw.githubusercontent.com/Sendouc/sendou.ink/1e1f02fb2a98eb8dd5798f67567f2e2f1d3e6513/public/img/stage-banners/goby-arena.png";
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
          {infos.map((info, i) => (
            <div key={i}>{info}</div>
          ))}
        </div>
      )}
    </>
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
