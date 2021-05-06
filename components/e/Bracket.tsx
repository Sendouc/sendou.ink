import { useState } from "react";
import styles from "./Bracket.module.scss";
import ColumnHeaders from "./ColumnHeaders";
import Match from "./Match";

const Bracket = ({
  teams = [
    "NSTC",
    "Radiance",
    "FTWIN!",
    "Team olive",
    "Freeze",
    "Kraken Paradise",
    "JFG",
    "Chimera",
  ],
}: {
  teams?: string[];
}) => {
  const [teamHovered, setTeamHovered] = useState<string | undefined>(undefined);

  return (
    <div className={[styles.theme, styles["theme-dark-trendy"]].join(" ")}>
      <ColumnHeaders />
      <div className={[styles.bracket, styles["disable-image"]].join(" ")}>
        <div className={styles.column}>
          <Match
            topTeam={{ seed: 1, name: "NSTC", score: 2 }}
            bottomTeam={{ seed: 8, name: "Radiance", score: 1 }}
            teamHovered={teamHovered}
            setTeamHovered={setTeamHovered}
            isConcluded
          />

          <Match
            topTeam={{ seed: 4, name: "FTWin!", score: 1 }}
            bottomTeam={{ seed: 5, name: "Team Olive", score: 2 }}
            teamHovered={teamHovered}
            setTeamHovered={setTeamHovered}
            isConcluded
          />

          <Match
            topTeam={{ seed: 2, name: "FreeZe", score: 2 }}
            bottomTeam={{ seed: 7, name: "Kraken Paradise", score: 0 }}
            teamHovered={teamHovered}
            setTeamHovered={setTeamHovered}
            isConcluded
          />

          <Match
            topTeam={{ seed: 3, name: "JFG", score: 2 }}
            bottomTeam={{ seed: 6, name: "Chimera", score: 1 }}
            teamHovered={teamHovered}
            setTeamHovered={setTeamHovered}
            isConcluded
          />
        </div>

        <div className={styles.column}>
          <Match
            topTeam={{ seed: 1, name: "NSTC", score: 1 }}
            bottomTeam={{ seed: 5, name: "Team Olive", score: 2 }}
            teamHovered={teamHovered}
            setTeamHovered={setTeamHovered}
            isConcluded
          />

          <Match
            topTeam={{ seed: 2, name: "FreeZe", score: 1 }}
            bottomTeam={{ seed: 3, name: "JFG", score: 1 }}
            teamHovered={teamHovered}
            setTeamHovered={setTeamHovered}
          />
        </div>

        <div className={styles.column}>
          <Match
            topTeam={{ seed: 5, name: "Team Olive" }}
            teamHovered={teamHovered}
            setTeamHovered={setTeamHovered}
          />
        </div>
      </div>
    </div>
  );
};

export default Bracket;
