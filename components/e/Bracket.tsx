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

  const rounds = getMatchUps(teams);

  return (
    <div className={[styles.theme, styles["theme-dark-trendy"]].join(" ")}>
      <ColumnHeaders />
      <div className={styles.bracket}>
        {rounds.map((round, roundIndex) => {
          return (
            <div className={styles.column}>
              {round.map((matchUp) => {
                return (
                  <Match
                    key={matchUp.topTeam?.seed}
                    topTeam={matchUp.topTeam}
                    bottomTeam={matchUp.bottomTeam}
                    teamHovered={teamHovered}
                    setTeamHovered={setTeamHovered}
                    isFirstRound={roundIndex === 0}
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

type TeamObject = {
  name: string;
  seed: number;
};

function getMatchUps(
  teams: string[]
): { topTeam?: TeamObject; bottomTeam?: TeamObject }[][] {
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

  const firstRound = matches.map(([topTeam, bottomTeam]) => ({
    topTeam: topTeam ? { name: teams[topTeam - 1], seed: topTeam } : undefined,
    bottomTeam: bottomTeam
      ? { name: teams[bottomTeam - 1], seed: bottomTeam }
      : undefined,
  }));

  const result = [firstRound];

  while (true) {
    console.assert(
      result[result.length - 1].length % 2 === 0,
      `expected rounds to be dividable by 2 but they were: ${
        result[result.length - 1].length
      }`
    );
    const roundsCount = result[result.length - 1].length / 2;

    result.push(
      new Array(roundsCount)
        .fill(null)
        .map((_) => ({ topTeam: undefined, bottomTeam: undefined }))
    );

    if (roundsCount === 1) break;
  }

  return result;
}

function changeIntoBye(seed: number, participantsCount: number) {
  return seed <= participantsCount ? seed : undefined;
}

export default Bracket;
