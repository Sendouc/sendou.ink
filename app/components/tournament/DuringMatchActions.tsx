import React, { useState } from "react";
import { Form, useMatches } from "remix";
import invariant from "tiny-invariant";
import { modesShortToLong } from "~/constants";
import { resolveHostInfo } from "~/core/tournament/utils";
import type {
  BracketModified,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import { modeToImageUrl, Unpacked } from "~/utils";
import { Button } from "../Button";
import { Label } from "../Label";
import { SubmitButton } from "../SubmitButton";
import { ActionSectionWrapper } from "./ActionSectionWrapper";
import { DuringMatchActionsRosters } from "./DuringMatchActionsRosters";

export function DuringMatchActions({
  ownTeam,
  currentMatch,
  currentRound,
}: {
  ownTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  currentMatch: Unpacked<Unpacked<BracketModified["winners"]>["matches"]>;
  currentRound: Unpacked<BracketModified["winners"]>;
}) {
  const [, parentRoute] = useMatches();
  const { teams, seeds } = parentRoute.data as FindTournamentByNameForUrlI;
  const [joinedRoom, setJoinedRoom] = useState(
    true ||
      (currentMatch.score?.[0] ?? 0) > 0 ||
      (currentMatch.score?.[1] ?? 0) > 0
  );

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

  if (joinedRoom) {
    const currentPosition =
      currentMatch.score?.reduce((acc, cur) => acc + cur, 1) ?? 1;
    const currentStage = currentRound.stages.find(
      (m) => m.position === currentPosition
    );
    invariant(currentStage, "currentStage is undefined");
    const { stage } = currentStage;

    const roundInfos: string[] = [
      `Pass ${roomPass} (${weHost ? "We" : "They"} host)`,
      `Add ${friendCodeToAdd}`,
      `${currentMatch.score?.join("-")} (Bo${currentRound.stages.length})`,
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
        </div>
        <div className="tournament-bracket__infos">
          {roundInfos.map((info) => (
            <div key={info}>{info}</div>
          ))}
        </div>
        {/* <ActionSectionWrapper justify-center>
          <div className="tournament-bracket__infos">
            <Form method="post">
              <input type="hidden" name="_action" value="UNDO_REPORT_SCORE" />
              <input
                type="hidden"
                name="position"
                value={currentPosition - 1}
              />
              <input type="hidden" name="matchId" value={currentMatch.id} />
              <div className="tournament-bracket__infos__columns">
                {roundInfo.map(([title, value]) => (
                  <React.Fragment key={title}>
                    <Label className="tournament-bracket__infos__label">
                      {title}
                    </Label>
                    <div className="tournament-bracket__infos__value">
                      {value}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </Form>
          </div>
        </ActionSectionWrapper> */}
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

  return (
    <ActionSectionWrapper>
      <h4 className="tournament-bracket__during-match__opponent-info">
        Opponent: {opponentTeam.name}
      </h4>
      <ol>
        <li>Add FC: {friendCodeToAdd}</li>
        {weHost ? (
          <li>
            <p>Your team hosting. Make a room (pass has to be {roomPass})</p>
          </li>
        ) : (
          <li>
            <p>Their team is hosting. Join the room (pass: {roomPass})</p>
          </li>
        )}
        <li>
          <p className="button-text-paragraph">
            Click{" "}
            <Button
              type="button"
              onClick={() => setJoinedRoom(true)}
              variant="minimal-success"
            >
              here
            </Button>{" "}
            when you have completed the steps above
          </p>
        </li>
      </ol>
    </ActionSectionWrapper>
  );
}
