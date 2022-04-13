import { Mode } from "@prisma/client";
import clsx from "clsx";
import clone from "just-clone";
import * as React from "react";
import { Form, useLoaderData } from "remix";
import { scoreValid } from "~/core/play/validators";
import { LFGMatchLoaderData } from "~/routes/play/match.$id";
import { userFullDiscordName } from "~/utils";
import { Button } from "../Button";
import { ModeImage } from "../ModeImage";
import { SubmitButton } from "../SubmitButton";

const NO_RESULT = "NO_RESULT";

interface MapListProps {
  mapList: {
    name: string;
    mode: Mode;
  }[];
  reportedWinnerIds: string[];
  canSubmitScore: boolean;
  groupIds: {
    our: string;
    their: string;
  };
}
export function MapList({
  mapList,
  reportedWinnerIds,
  canSubmitScore,
  groupIds,
}: MapListProps) {
  const [winners, setWinners] = React.useState<string[]>(reportedWinnerIds);
  const [cancelModeEnabled, setCancelModeEnabled] = React.useState(false);

  const updateWinners = (winnerId: string, index: number) => {
    const newWinners = clone(winners);

    // we make sure this option is only available for the last score
    if (winnerId === NO_RESULT) {
      newWinners.pop();
    } else if (index === newWinners.length) {
      newWinners.push(winnerId);
    } else {
      newWinners[index] = winnerId;
    }

    setWinners(newWinners);
  };

  const selectInvisible = (index: number) => {
    if (scoreValid(winners, mapList.length) && winners.length <= index) {
      return true;
    }
    if (index > winners.length) return true;

    return false;
  };

  if (cancelModeEnabled)
    return (
      <CancelMatch disableCancelMode={() => setCancelModeEnabled(false)} />
    );

  return (
    <ol className="play-match__stages">
      <h2 className="play-match__map-list-header">Map list</h2>
      <div className="play-match__best-of">Best of {mapList.length}</div>
      {canSubmitScore && (
        <li className="play-match__select-column-header">
          <span>Winner</span>
        </li>
      )}
      {mapList.map((stage, i) => {
        return (
          <li key={`${stage.name}-${stage.mode}`} className="play-match__stage">
            {canSubmitScore && (
              <select
                className={clsx("play-match__select", {
                  invisible: selectInvisible(i),
                })}
                onChange={(e) => updateWinners(e.target.value, i)}
                value={winners[i] ?? NO_RESULT}
              >
                <option value={NO_RESULT}></option>
                <option value={groupIds.our}>Us</option>
                <option value={groupIds.their}>Them</option>
              </select>
            )}
            <ModeImage className="play-match__mode" mode={stage.mode} />
            {i + 1}){" "}
            <span className="play-match__stage-name">{stage.name}</span>
          </li>
        );
      })}
      {canSubmitScore && (
        <Submitter
          mapList={mapList}
          winners={winners}
          groupIds={groupIds}
          isFirstTimeReporting={reportedWinnerIds.length === 0}
          enableCancelMode={() => setCancelModeEnabled(true)}
        />
      )}
    </ol>
  );
}

function Submitter({
  mapList,
  winners,
  groupIds,
  isFirstTimeReporting,
  enableCancelMode,
}: {
  mapList: MapListProps["mapList"];
  winners: string[];
  groupIds: {
    our: string;
    their: string;
  };
  isFirstTimeReporting: boolean;
  enableCancelMode: () => void;
}) {
  const warningText = scoreValid(winners, mapList.length)
    ? undefined
    : "Report more maps to submit the score";

  if (warningText) {
    return (
      <div className="play-match__error-text">
        {warningText}
        <div>
          <div className="flex flex-col">
            or{" "}
            <Button
              variant="minimal-destructive"
              tiny
              onClick={enableCancelMode}
            >
              Cancel Match
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const score = winners.reduce(
    (acc: [number, number], winnerId) => {
      if (winnerId === groupIds.our) acc[0]++;
      else acc[1]++;

      return acc;
    },
    [0, 0]
  );

  return (
    <div className="play-match__score-submit-button">
      <Form method="post">
        <input type="hidden" name="winnerIds" value={JSON.stringify(winners)} />
        <SubmitButton
          type="submit"
          name="_action"
          value={isFirstTimeReporting ? "REPORT_SCORE" : "EDIT_REPORTED_SCORE"}
          actionType={
            isFirstTimeReporting ? "REPORT_SCORE" : "EDIT_REPORTED_SCORE"
          }
          loadingText="Submitting..."
        >
          Submit {score.join("-")}
        </SubmitButton>
      </Form>
    </div>
  );
}

function CancelMatch({ disableCancelMode }: { disableCancelMode: () => void }) {
  const data = useLoaderData<LFGMatchLoaderData>();

  return (
    <div className="play-match__cancel-match">
      <h2 className="play-match__map-list-header">Cancel match</h2>
      <p>
        You should only cancel the match if one player can&apos;t be reached
        (give them at least 15 minutes to answer) or becomes unavailable to play
        (either before the set or in the middle of it).
      </p>
      <p>
        When canceling the match the team with 4 players available to play gains
        SP as if they had played and won the set. The player who is not
        available to play loses SP as if they played and lost the set. The
        teammates of the player who left will not have a change in their
        SP&apos;s.
      </p>
      <Form className="play-match__cancel-match__form" method="post">
        <h4>Choose missing player</h4>
        <div className="play-match__cancel-match__radios">
          {data.groups
            .flatMap((g) => g.members)
            .map((m) => (
              <span
                key={m.id}
                title={userFullDiscordName(m)}
                className="flex items-center"
              >
                <input
                  id={m.id}
                  type="radio"
                  name="cancelCausingUserId"
                  value={m.id}
                  required
                  className="mr-1"
                />
                <label htmlFor={m.id}>{m.discordName}</label>
              </span>
            ))}
        </div>
        <div className="flex items-center mt-2">
          <Button
            type="submit"
            variant="destructive"
            name="_action"
            value="CANCEL_MATCH"
            tiny
            className="mr-3"
          >
            Cancel match
          </Button>
          <Button tiny type="button" onClick={disableCancelMode}>
            Nevermind
          </Button>
        </div>
      </Form>
    </div>
  );
}
