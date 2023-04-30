import { Form, useOutletContext } from "@remix-run/react";
import { ScoreReporterRosters } from "./ScoreReporterRosters";
import { SubmitButton } from "~/components/SubmitButton";
import invariant from "tiny-invariant";
import clsx from "clsx";
import type { TournamentToolsLoaderData } from "../routes/to.$id";
import type { RankedModeShort } from "~/modules/in-game-lists";

export function ScoreReporter() {
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();

  const opponentTeam = parentRouteData.teams.find(
    (team) =>
      [currentMatch.participants?.[0], currentMatch.participants?.[1]].includes(
        team.name
      ) && team.id !== ownTeam.id
  );
  invariant(opponentTeam, "opponentTeam is undefined");

  const currentPosition =
    currentMatch.score?.reduce((acc, cur) => acc + cur, 1) ?? 1;
  const currentStage = currentRound.stages.find(
    (s) => s.position === currentPosition
  );
  invariant(currentStage, "currentStage is undefined");
  const { stage } = currentStage;

  const roundInfos = [
    <>
      <b>{currentMatch.score?.join("-")}</b> (Best of{" "}
      {currentRound.stages.length})
    </>,
  ];

  return (
    <div className="tournament-bracket__during-match-actions">
      <FancyStageBanner
        stage={stage}
        roundNumber={currentPosition}
        infos={roundInfos}
      >
        {currentPosition > 1 && (
          <Form method="post">
            <input type="hidden" name="_action" value="UNDO_REPORT_SCORE" />
            <input type="hidden" name="position" value={currentPosition - 1} />
            <input type="hidden" name="matchId" value={currentMatch.id} />
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
          key={currentMatch.id}
          ownTeam={ownTeam}
          opponentTeam={opponentTeam}
          matchId={currentMatch.id}
          position={currentPosition}
        />
      </ActionSectionWrapper>
    </div>
  );
}

function FancyStageBanner({
  stage,
  roundNumber,
  infos,
  children,
}: {
  stage: { mode: RankedModeShort; name: string };
  roundNumber: number;
  infos?: JSX.Element[];
  children?: React.ReactNode;
}) {
  // xxx: dynamic stage img
  const stageNameToBannerImageUrl = (name: string) => {
    return "https://raw.githubusercontent.com/Sendouc/sendou.ink/1e1f02fb2a98eb8dd5798f67567f2e2f1d3e6513/public/img/stage-banners/goby-arena.png";
  };

  const style = {
    "--_tournament-bg-url": `url("${stageNameToBannerImageUrl(stage.name)}")`,
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
            <img
              className="tournament-bracket__stage-banner__top-bar__mode-image"
              src={modeToImageUrl(stage.mode)}
              alt=""
            />
            {modesShortToLong[stage.mode]} on {stage.name}
          </h4>
          <h4>Stage {roundNumber}</h4>
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
