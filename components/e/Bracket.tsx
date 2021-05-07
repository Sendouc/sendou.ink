import { useState } from "react";
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

  const matchUps = getMatchUps(teams);
  console.log("matchUps", matchUps);

  return (
    <div className={[styles.theme, styles["theme-dark-trendy"]].join(" ")}>
      <ColumnHeaders />
      <div className={styles.bracket}>
        <div className={styles.column}>
          {matchUps.map((matchUp) => {
            return (
              <Match
                key={matchUp.topTeam?.seed}
                topTeam={matchUp.topTeam}
                bottomTeam={matchUp.bottomTeam}
                teamHovered={teamHovered}
                setTeamHovered={setTeamHovered}
                isFirstRound
              />
            );
          })}
        </div>

        <div className={styles.column}>
          <Match
            teamHovered={teamHovered}
            setTeamHovered={setTeamHovered}
            isConcluded
          />

          <Match teamHovered={teamHovered} setTeamHovered={setTeamHovered} />
          <Match teamHovered={teamHovered} setTeamHovered={setTeamHovered} />
          <Match teamHovered={teamHovered} setTeamHovered={setTeamHovered} />
        </div>

        <div className={styles.column}>
          <Match teamHovered={teamHovered} setTeamHovered={setTeamHovered} />
          <Match teamHovered={teamHovered} setTeamHovered={setTeamHovered} />
        </div>
        <div className={styles.column}>
          <Match teamHovered={teamHovered} setTeamHovered={setTeamHovered} />
        </div>
      </div>
    </div>
  );
};

function getMatchUps(teams: string[]) {
  const participantsCount = teams.length;
  const rounds = Math.ceil(Math.log(participantsCount) / Math.log(2));

  if (participantsCount < 2) {
    return [];
  }

  let matches: (number | undefined)[][] = [[1, 2]];

  for (var round = 1; round < rounds; round++) {
    const roundMatches = [];
    const sum = Math.pow(2, round + 1) + 1;

    for (var i = 0; i < matches.length; i++) {
      const team = matches[i][0];
      const team2 = matches[i][1];
      if (!team || !team2) {
        throw Error("invalid match");
      }
      let home = changeIntoBye(team, participantsCount);
      let away = changeIntoBye(sum - team, participantsCount);
      roundMatches.push([home, away]);
      home = changeIntoBye(sum - team2, participantsCount);
      away = changeIntoBye(team2, participantsCount);
      roundMatches.push([home, away]);
    }
    matches = roundMatches;
  }

  return matches.map(([topTeam, bottomTeam]) => ({
    topTeam: topTeam ? { name: teams[topTeam - 1], seed: topTeam } : undefined,
    bottomTeam: bottomTeam
      ? { name: teams[bottomTeam - 1], seed: bottomTeam }
      : undefined,
  }));
}

function changeIntoBye(seed: number, participantsCount: number) {
  return seed <= participantsCount ? seed : undefined;
}

export default Bracket;
