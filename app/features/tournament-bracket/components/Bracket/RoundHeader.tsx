import clsx from "clsx";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useDeadline } from "./useDeadline";
import { useAutoRerender } from "~/hooks/useAutoRerender";

export function RoundHeader({
  roundId,
  name,
  bestOf,
  showInfos,
}: {
  roundId: number;
  name: string;
  bestOf?: 3 | 5 | 7;
  showInfos?: boolean;
}) {
  const hasDeadline = ![
    "WB Finals",
    "Grand Finals",
    "Bracket Reset",
    "Finals",
  ].includes(name);

  return (
    <div>
      <div className="elim-bracket__round-header">{name}</div>
      {showInfos && bestOf ? (
        <div className="elim-bracket__round-header__infos">
          <div>Bo{bestOf}</div>
          {hasDeadline ? <Deadline roundId={roundId} bestOf={bestOf} /> : null}
        </div>
      ) : (
        <div className="elim-bracket__round-header__infos invisible">
          Hidden
        </div>
      )}
    </div>
  );
}

function Deadline({ roundId, bestOf }: { roundId: number; bestOf: 3 | 5 | 7 }) {
  useAutoRerender("ten seconds");
  const isMounted = useIsMounted();
  const deadline = useDeadline(roundId, bestOf);

  if (!deadline) return null;

  return (
    <div
      className={clsx({
        "text-warning": isMounted && deadline < new Date(),
      })}
    >
      DL{" "}
      {deadline.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })}
    </div>
  );
}
