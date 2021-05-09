import { useState } from "react";
import { SingleEliminationBracket } from "utils/bracket/Bracket";
import styles from "./Bracket.module.scss";
import ColumnHeaders from "./ColumnHeaders";
import Match from "./Match";

const Bracket = ({
  teams = [
    "NSTC",
    "Radiance",
    "FTWIN!",
    "Team Olive",
    "Freeze",
    "Kraken Paradise",
    "JFG",
    "Chimera",
    "Creme Fresh",
    "Team Paradise",
    "Extermination",
  ],
}: {
  teams?: string[];
}) => {
  const [teamHovered, setTeamHovered] = useState<string | undefined>(undefined);

  const bracket = new SingleEliminationBracket({
    teams,
    matchResults: {
      14: { bottomScore: 2, topScore: 1, finished: true },
      5: { bottomScore: 2, topScore: 1, finished: true },
    },
  });

  return (
    <div className={[styles.theme, styles["theme-dark-trendy"]].join(" ")}>
      <ColumnHeaders roundsCount={bracket.rounds.length} bracket="SE" />
      <div className={styles.bracket}>
        {bracket.rounds.map((round, roundIndex) => {
          return (
            <div key={round[0].id} className={styles.column}>
              {round.map((match) => {
                return (
                  <Match
                    key={match.id}
                    topTeam={match.topTeam}
                    bottomTeam={match.bottomTeam}
                    teamHovered={teamHovered}
                    setTeamHovered={setTeamHovered}
                    isFirstRound={roundIndex === 0}
                    isConcluded={match.finished}
                    noAncestors={match.noAncestors}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bracket;
