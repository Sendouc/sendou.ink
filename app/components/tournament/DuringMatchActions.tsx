import React, { useState } from "react";
import { useMatches } from "remix";
import invariant from "tiny-invariant";
import { resolveHostInfo } from "~/core/tournament/utils";
import type {
  BracketModified,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import { Unpacked } from "~/utils";
import { Button } from "../Button";
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
    const currentStage = currentRound.stages.find((m) => m.position === 1);
    invariant(currentStage, "currentStage is undefined");
    const { stage } = currentStage;

    const roundInfo = [
      ["Opponent", opponentTeam.name],
      ["Room pass", `${roomPass} (${weHost ? "We" : "They"} host)`],
      ["Friend code to add", friendCodeToAdd],
      ["Score", currentMatch.score?.join("-")],
      ["Current map", `${stage.mode} ${stage.name}`],
    ];

    return (
      <ActionSectionWrapper>
        <div className="flex flex-wrap">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {roundInfo.map(([title, value]) => (
              <React.Fragment key={title}>
                <label className="plain font-bold">{title}</label>
                <div>{value}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <DuringMatchActionsRosters
          ownTeam={ownTeam}
          opponentTeam={opponentTeam}
          stage={stage}
        />
      </ActionSectionWrapper>
    );
  }

  return (
    <ActionSectionWrapper>
      <h4 className="font-bold mr-6">Opponent: {opponentTeam.name}</h4>
      <ol className="list-decimal">
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
