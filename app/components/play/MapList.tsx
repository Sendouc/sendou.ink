import { Mode } from "@prisma/client";
import clsx from "clsx";
import clone from "just-clone";
import { useState } from "react";
import { scoreValid } from "~/core/play/validators";
import { ModeImage } from "../ModeImage";

const NO_RESULT = "NO_RESULT";

export function MapList({
  mapList,
  canSubmitScore,
  groupIds,
}: {
  mapList: {
    name: string;
    mode: Mode;
  }[];
  canSubmitScore: boolean;
  groupIds: {
    our: string;
    their: string;
  };
}) {
  const [winners, setWinners] = useState<string[]>([]);

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

  // TODO: not properly handling scores getting reported after conclusion
  const warningText = scoreValid(winners, mapList.length)
    ? undefined
    : "Report more maps to submit the score";

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
                  invisible: i > winners.length,
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
      <div className="play-match__error-text">{warningText}</div>
    </ol>
  );
}
