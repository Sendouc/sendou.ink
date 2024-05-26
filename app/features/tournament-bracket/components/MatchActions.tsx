import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { Label } from "~/components/Label";
import { SubmitButton } from "~/components/SubmitButton";
import { useUser } from "~/features/auth/core/user";
import { useTournament } from "~/features/tournament/routes/to.$id";
import type { TournamentDataTeam } from "../core/Tournament.server";
import type { TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import {
  isSetOverByScore,
  matchIsLocked,
  tournamentTeamToActiveRosterUserIds,
} from "../tournament-bracket-utils";
import type { Result } from "./StartedMatch";
import { TeamRosterInputs } from "./TeamRosterInputs";
import * as PickBan from "../core/PickBan";
import { MatchActionsBanPicker } from "./MatchActionsBanPicker";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { EditIcon } from "~/components/icons/Edit";

export function MatchActions({
  teams,
  position,
  result,
  scores,
  presentational: _presentational,
}: {
  teams: [TournamentDataTeam, TournamentDataTeam];
  position: number;
  result?: Result;
  scores: [number, number];
  presentational?: boolean;
}) {
  const user = useUser();
  const tournament = useTournament();
  const data = useLoaderData<TournamentMatchLoaderData>();

  const [checkedPlayers, setCheckedPlayers] = React.useState<
    [number[], number[]]
  >([
    tournamentTeamToActiveRosterUserIds(teams[0]) ?? [],
    tournamentTeamToActiveRosterUserIds(teams[1]) ?? [],
  ]);

  const [winnerId, setWinnerId] = React.useState<number | undefined>();
  const [points, setPoints] = React.useState<[number, number]>([0, 0]);
  const [organizerEditing, setOrganizerEditing] = React.useState(false);

  const presentational =
    !organizerEditing && (_presentational || Boolean(result));

  const newScore: [number, number] = [
    scores[0] + (winnerId === teams[0].id ? 1 : 0),
    scores[1] + (winnerId === teams[1].id ? 1 : 0),
  ];
  const wouldEndSet = isSetOverByScore({
    count: data.match.roundMaps?.count ?? data.match.bestOf,
    countType: data.match.roundMaps?.type ?? "BEST_OF",
    scores: newScore,
  });

  const showPoints = React.useMemo(
    () =>
      tournament.bracketByIdxOrDefault(
        tournament.matchIdToBracketIdx(data.match.id) ?? 0,
      ).collectResultsWithPoints,
    [tournament, data.match.id],
  );

  const turnOf =
    data.match.roundMaps &&
    PickBan.turnOf({
      results: data.results,
      maps: data.match.roundMaps,
      teams: [teams[0].id, teams[1].id],
      mapList: data.mapList,
    });

  if (turnOf) {
    return <MatchActionsBanPicker key={turnOf} teams={[teams[0], teams[1]]} />;
  }

  const bothTeamsHaveActiveRosters = teams.every(
    tournamentTeamToActiveRosterUserIds,
  );

  const canEditFinishedSetScore =
    result && tournament.isOrganizer(user) && !tournament.ctx.isFinalized;

  return (
    <div>
      <TeamRosterInputs
        teams={teams}
        winnerId={winnerId}
        setWinnerId={setWinnerId}
        checkedPlayers={checkedPlayers}
        setCheckedPlayers={setCheckedPlayers}
        points={showPoints ? points : undefined}
        setPoints={setPoints}
        result={result}
        organizerEditing={organizerEditing}
      />
      {!presentational && bothTeamsHaveActiveRosters ? (
        <Form
          method="post"
          className="tournament-bracket__during-match-actions__actions"
        >
          <input type="hidden" name="winnerTeamId" value={winnerId ?? ""} />
          {showPoints ? (
            <input type="hidden" name="points" value={JSON.stringify(points)} />
          ) : null}
          <input type="hidden" name="position" value={position} />
          {!organizerEditing && (
            <ReportScoreButtons
              winnerIdx={winnerId ? winningTeamIdx() : undefined}
              points={showPoints ? points : undefined}
              winnerOfSetName={winnerOfSetName()}
              wouldEndSet={wouldEndSet}
              matchLocked={matchIsLocked({
                matchId: data.match.id,
                scores: scores,
                tournament,
              })}
              newScore={newScore}
            />
          )}
        </Form>
      ) : null}
      {canEditFinishedSetScore ? (
        <EditScoreForm
          editing={organizerEditing}
          setEditing={setOrganizerEditing}
          checkedPlayers={checkedPlayers}
          resultId={result.id}
          points={showPoints ? points : undefined}
        />
      ) : null}
      {!result && presentational ? (
        <div className="tournament-bracket__during-match-actions__actions">
          <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
            No permissions to report score
          </p>
        </div>
      ) : null}
    </div>
  );

  function winnerOfSetName() {
    if (!winnerId) return;

    const setWinningIdx = newScore[0] > newScore[1] ? 0 : 1;

    const result = teams[setWinningIdx].name;
    invariant(result, "No set winning team");

    return result;
  }

  function winningTeamIdx() {
    if (!winnerId) return;
    if (teams[0].id === winnerId) return 0;
    if (teams[1].id === winnerId) return 1;

    throw new Error("No winning team matching the id");
  }
}

function ReportScoreButtons({
  points,
  winnerIdx,
  winnerOfSetName,
  wouldEndSet,
  matchLocked,
  newScore,
}: {
  points?: [number, number];
  winnerIdx?: number;
  winnerOfSetName?: string;
  wouldEndSet: boolean;
  matchLocked: boolean;
  newScore: [number, number];
}) {
  const user = useUser();
  const tournament = useTournament();
  const confirmCheckId = React.useId();
  const [endConfirmation, setEndConfirmation] = React.useState(false);

  if (matchLocked) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Match is pending to be casted. Please wait a bit
      </p>
    );
  }

  if (
    points &&
    typeof winnerIdx === "number" &&
    points[winnerIdx] <= points[winnerIdx === 0 ? 1 : 0]
  ) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Winner should have higher score than loser
      </p>
    );
  }

  if (
    points &&
    ((points[0] === 100 && points[1] !== 0) ||
      (points[0] !== 0 && points[1] === 100))
  ) {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        If there was a KO (100 score), other team should have 0 score
      </p>
    );
  }

  if (typeof winnerIdx !== "number") {
    return (
      <p className="tournament-bracket__during-match-actions__amount-warning-paragraph">
        Please select the winner of this map
      </p>
    );
  }

  const confirmationClass = () => {
    const ownTeam = tournament.teamMemberOfByUser(user);

    // TO reporting
    if (!ownTeam) return "text-main-forced";
    if (ownTeam.name === winnerOfSetName) return "text-success";

    return "text-warning";
  };

  return (
    <div className="stack md items-center">
      {wouldEndSet ? (
        <div className="stack horizontal sm items-center">
          <input
            type="checkbox"
            onChange={(e) => setEndConfirmation(e.target.checked)}
            id={confirmCheckId}
            data-testid="end-confirmation"
          />
          <Label spaced={false} htmlFor={confirmCheckId}>
            <span className="text-main-forced">Set over?</span>{" "}
            <span className={confirmationClass()}>
              ({newScore.join("-")} win for {winnerOfSetName})
            </span>
          </Label>
        </div>
      ) : null}
      <SubmitButton
        size="tiny"
        _action="REPORT_SCORE"
        testId="report-score-button"
        disabled={wouldEndSet && !endConfirmation}
      >
        {wouldEndSet ? "Report & end set" : "Report"}
      </SubmitButton>
    </div>
  );
}

// xxx: editing points not working
// xxx: remembers old selected roster after change
function EditScoreForm({
  editing,
  setEditing,
  checkedPlayers,
  resultId,
  points,
}: {
  editing: boolean;
  setEditing: (value: boolean) => void;
  checkedPlayers: [number[], number[]];
  resultId: number;
  points?: [number, number];
}) {
  const fetcher = useFetcher();

  if (editing) {
    return (
      <fetcher.Form
        method="post"
        className="stack horizontal md justify-center"
      >
        <input type="hidden" name="resultId" value={resultId} />
        <input
          type="hidden"
          name="rosters"
          value={JSON.stringify(checkedPlayers.flat())}
        />
        {points ? (
          <input type="hidden" name="points" value={JSON.stringify(points)} />
        ) : undefined}
        <SubmitButton
          size="tiny"
          state={fetcher.state}
          _action="UPDATE_REPORTED_SCORE"
        >
          Save
        </SubmitButton>
        <Button
          variant="destructive"
          size="tiny"
          onClick={() => setEditing(false)}
        >
          Cancel
        </Button>
      </fetcher.Form>
    );
  }

  return (
    <div className="mt-6">
      <Button
        icon={<EditIcon />}
        variant="outlined"
        size="tiny"
        className="mx-auto"
        onClick={() => setEditing(true)}
      >
        Edit
      </Button>
    </div>
  );
}
