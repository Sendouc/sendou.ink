import { useState } from "react";
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

export function DuringMatchActions({
  ownTeam,
  currentMatch,
}: {
  ownTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  currentMatch: Unpacked<Unpacked<BracketModified["winners"]>["matches"]>;
}) {
  const [, parentRoute] = useMatches();
  const { teams, seeds } = parentRoute.data as FindTournamentByNameForUrlI;
  const [joinedRoom, setJoinedRoom] = useState(
    (currentMatch.score?.[0] ?? 0) > 0 || (currentMatch.score?.[1] ?? 0) > 0
  );

  const opponentTeam = teams.find(
    (team) =>
      [currentMatch.participants?.[0], currentMatch.participants?.[1]].includes(
        team.name
      ) && team.id !== ownTeam.id
  );
  invariant(opponentTeam, "opponentTeam is undefined");

  if (joinedRoom) {
    return (
      <ActionSectionWrapper>
        <h4>Opponent: {opponentTeam.name}</h4>
        <div>scores map etc.</div>
      </ActionSectionWrapper>
    );
  }

  const { weHost, friendCodeToAdd, roomPass } = resolveHostInfo({
    ourTeam: ownTeam,
    theirTeam: opponentTeam,
    seeds,
  });

  return (
    <ActionSectionWrapper>
      <h4>Opponent: {opponentTeam.name}</h4>
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
