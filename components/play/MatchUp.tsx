import { Box } from "@chakra-ui/react";
import { GetLadderDayData } from "prisma/queries/getLadderDay";
import { Unpacked } from "utils/types";
import LadderTeam from "./LadderTeam";

interface Props {
  matchUp: Unpacked<NonNullable<GetLadderDayData>["matches"]>;
}

const MatchUp: React.FC<Props> = ({ matchUp }) => {
  return (
    <>
      <Box>
        <LadderTeam
          roster={matchUp.players
            .filter((player) => player.team === "ALPHA")
            .map((player) => player.user)}
        />
      </Box>
      <Box fontSize="xl">
        {matchUp.teamAScore}-{matchUp.teamBScore}
      </Box>
      <Box>
        <LadderTeam
          roster={matchUp.players
            .filter((player) => player.team === "BRAVO")
            .map((player) => player.user)}
        />
      </Box>
    </>
  );
};

export default MatchUp;
