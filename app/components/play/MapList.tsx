import { Mode } from "@prisma/client";
import clsx from "clsx";
import clone from "just-clone";
import { useState } from "react";
import { Form } from "remix";
import { scoreValid } from "~/core/play/validators";
import { Button } from "../Button";
import { ModeImage } from "../ModeImage";

const NO_RESULT = "NO_RESULT";

interface MapListProps {
  mapList: {
    name: string;
    mode: Mode;
  }[];
  canSubmitScore: boolean;
  groupIds: {
    our: string;
    their: string;
  };
}
export function MapList({ mapList, canSubmitScore, groupIds }: MapListProps) {
  const [winners, setWinners] = useState<string[]>(
    new Array(5).fill(null).map(() => "5f31654d-977b-402b-817a-6f20cd933aa5")
  );

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
      {canSubmitScore && <Submitter mapList={mapList} winners={winners} />}
    </ol>
  );
}

function Submitter({
  mapList,
  winners,
}: {
  mapList: MapListProps["mapList"];
  winners: string[];
}) {
  const warningText = scoreValid(winners, mapList.length)
    ? undefined
    : "Report more maps to submit the score";

  if (warningText) {
    return <div className="play-match__error-text">{warningText}</div>;
  }

  const ids = Array.from(new Set(winners));
  const score = winners.reduce(
    (acc: [number, number], winnerId) => {
      if (winnerId === ids[0]) acc[0]++;
      else acc[1]++;

      return acc;
    },
    [0, 0]
  );

  return (
    <div className="play-match__score-submit-button">
      <Form method="post">
        <input type="hidden" name="winnerIds" value={JSON.stringify(winners)} />
        <Button type="submit" name="_action" value="REPORT_SCORE">
          Submit {score.join("-")}
        </Button>
      </Form>
    </div>
  );
}
