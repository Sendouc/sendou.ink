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
      <ColumnHeaders roundsCount={rounds.length} bracket="WINNERS" />
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
                    noAncestors={matchUp.noAncestors}
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

type Bracket = {
  topTeam?: TeamObject;
  bottomTeam?: TeamObject;
  matchNumber?: number;
  noAncestors?: boolean;
}[][];

function getMatchUps(teams: string[]): Bracket {
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

  let matchNumber = 1;

  const firstRound = matches.map(([topTeam, bottomTeam]) => ({
    matchNumber: topTeam && bottomTeam ? matchNumber++ : undefined,
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
      new Array(roundsCount).fill(null).map((_) => ({
        matchNumber: matchNumber++,
        topTeam: undefined,
        bottomTeam: undefined,
      }))
    );

    if (roundsCount === 1) break;
  }

  return advanceTeamsBasedOnByes(result);
}

function changeIntoBye(seed: number, participantsCount: number) {
  return seed <= participantsCount ? seed : undefined;
}

// TODO: send to losers if necessary
function advanceTeamsBasedOnByes(bracket: Bracket): Bracket {
  if (bracket.length < 2) return bracket;

  const result = [...bracket];
  const firstRound = [...bracket[0]];

  for (const round of result[1]) {
    const topTeamRound = firstRound.shift();
    const bottomTeamRound = firstRound.shift();
    if (!topTeamRound || !bottomTeamRound) {
      throw Error("unexpected no topTeamRound or no bottomTeamRound");
    }

    let topHadBye = false;
    let bottomHadBye = false;

    if (topTeamRound.topTeam && !topTeamRound.bottomTeam) {
      topHadBye = true;
      round.topTeam = topTeamRound.topTeam;
    } else if (!topTeamRound.topTeam && topTeamRound.bottomTeam) {
      topHadBye = true;
      round.topTeam = topTeamRound.bottomTeam;
    }

    if (bottomTeamRound.topTeam && !bottomTeamRound.bottomTeam) {
      bottomHadBye = true;
      round.bottomTeam = bottomTeamRound.topTeam;
    } else if (!bottomTeamRound.topTeam && bottomTeamRound.bottomTeam) {
      bottomHadBye = true;
      round.bottomTeam = bottomTeamRound.bottomTeam;
    }

    if (topHadBye && bottomHadBye) {
      round.noAncestors = true;
    }
  }

  return result;
}

export default Bracket;
