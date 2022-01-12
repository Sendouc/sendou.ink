import { Form, useMatches } from "remix";
import invariant from "tiny-invariant";
import { modesShortToLong } from "~/constants";
import { resolveHostInfo } from "~/core/tournament/utils";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import type { BracketModified } from "~/services/bracket";
import { modeToImageUrl, Unpacked } from "~/utils";
import { SubmitButton } from "../SubmitButton";
import { ActionSectionWrapper } from "./ActionSectionWrapper";
import { DuringMatchActionsRosters } from "./DuringMatchActionsRosters";

export function DuringMatchActions({
  ownTeam,
  currentMatch,
  currentRound,
}: {
  ownTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  currentMatch: Unpacked<Unpacked<BracketModified["rounds"]>["matches"]>;
  currentRound: Unpacked<BracketModified["rounds"]>;
}) {
  const [, parentRoute] = useMatches();
  const { teams, seeds } = parentRoute.data as FindTournamentByNameForUrlI;

  const opponentTeam = teams.find(
    (team) =>
      [currentMatch.participants?.[0], currentMatch.participants?.[1]].includes(
        team.name
      ) && team.id !== ownTeam.id
  );
  invariant(opponentTeam, "opponentTeam is undefined");

  const { weHost, friendCodeToAdd, roomPass } = resolveHostInfo({
    ourTeam: ownTeam,
    theirTeam: opponentTeam,
    seeds,
  });

  const currentPosition =
    currentMatch.score?.reduce((acc, cur) => acc + cur, 1) ?? 1;
  const currentStage = currentRound.stages.find(
    (m) => m.position === currentPosition
  );
  invariant(currentStage, "currentStage is undefined");
  const { stage } = currentStage;

  const roundInfos = [
    <>
      Add <b>{friendCodeToAdd}</b>
    </>,
    <>
      Pass <b>{roomPass}</b> ({weHost ? "We" : "They"} host)
    </>,
    <>
      <b>{currentMatch.score?.join("-")}</b> (Best of{" "}
      {currentRound.stages.length})
    </>,
  ];

  return (
    <div className="tournament-bracket__during-match-actions">
      <div className="tournament-bracket__stage-banner">
        <div className="tournament-bracket__stage-banner__top-bar">
          <h4 className="tournament-bracket__stage-banner__top-bar__header">
            <img
              className="tournament-bracket__stage-banner__top-bar__mode-image"
              src={modeToImageUrl(stage.mode)}
            />
            {modesShortToLong[stage.mode]} on {stage.name}
          </h4>
          <h4>Stage {currentPosition}</h4>
        </div>
        {currentPosition > 1 && (
          <Form method="post">
            <input type="hidden" name="_action" value="UNDO_REPORT_SCORE" />
            <input type="hidden" name="position" value={currentPosition - 1} />
            <input type="hidden" name="matchId" value={currentMatch.id} />
            <div className="tournament-bracket__stage-banner__bottom-bar">
              <SubmitButton
                actionType="UNDO_REPORT_SCORE"
                className="tournament-bracket__stage-banner__undo-button"
                loadingText="Undoing..."
              >
                Undo last score
              </SubmitButton>
            </div>
          </Form>
        )}
      </div>
      <div className="tournament-bracket__infos">
        {roundInfos.map((info, i) => (
          <div key={i}>{info}</div>
        ))}
      </div>
      <ActionSectionWrapper>
        <DuringMatchActionsRosters
          ownTeam={ownTeam}
          opponentTeam={opponentTeam}
          matchId={currentMatch.id}
          position={currentPosition}
        />
      </ActionSectionWrapper>
    </div>
  );
}
