import * as React from "react";

import { Dialog } from "~/components/Dialog";
import { generateTournamentRoundMaplist } from "../core/toMapList";
import type { Bracket } from "../core/Bracket";
import { useTournamentToSetMapPool } from "~/features/tournament/routes/to.$id";
import invariant from "tiny-invariant";

export function BracketMapListDialog({
  isOpen,
  close,
  bracket,
}: {
  isOpen: boolean;
  close: () => void;
  bracket: Bracket;
}) {
  const toSetMapPool = useTournamentToSetMapPool();

  // xxx: fallback?
  invariant(toSetMapPool, "Expected toSetMapPool to be defined");

  const [maps, setMaps] = React.useState(() =>
    generateTournamentRoundMaplist({
      mapCounts: bracket.defaultRoundBestOfs,
      pool: toSetMapPool,
      rounds: bracket.data.round,
      type: bracket.type,
    }),
  );

  return (
    <Dialog isOpen={isOpen} close={close}>
      test
    </Dialog>
  );
}
