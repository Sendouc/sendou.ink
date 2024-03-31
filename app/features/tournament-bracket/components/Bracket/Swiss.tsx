import type { Bracket as BracketType } from "../../core/Bracket";
import { RoundHeader } from "./RoundHeader";
import { Match } from "./Match";
import type { Match as MatchType } from "~/modules/brackets-model";
import { groupNumberToLetter } from "../../tournament-bracket-utils";
import { Button } from "~/components/Button";
import clsx from "clsx";
import * as React from "react";

// xxx: button to advance bracket
export function SwissBracket({ bracket }: { bracket: BracketType }) {
  const [selectedGroupIndex, setSelectedGroupIndex] = React.useState(0);
  const groups = getGroups(bracket);

  const selectedGroup = groups[selectedGroupIndex];

  const rounds = bracket.data.round.filter(
    (r) => r.group_id === selectedGroup.groupId,
  );

  return (
    <div className="stack xl">
      <div className="stack lg">
        {groups.length > 0 && (
          <div className="stack horizontal">
            {groups.map((g, i) => (
              <Button
                key={g.groupId}
                onClick={() => setSelectedGroupIndex(i)}
                className={clsx(
                  "tournament-bracket__bracket-nav__link tournament-bracket__bracket-nav__link__big",
                  {
                    "tournament-bracket__bracket-nav__link__selected":
                      selectedGroupIndex === i,
                  },
                )}
              >
                {g.groupName.split(" ")[1]}
              </Button>
            ))}
          </div>
        )}
        <div className="stack lg">
          {rounds.flatMap((round) => {
            const matches = bracket.data.match.filter(
              (match) =>
                match.round_id === round.id &&
                match.group_id === selectedGroup.groupId,
            );

            const bestOf = round.maps?.count;

            const someMatchOngoing = matches.some(
              (match) =>
                match.opponent1 &&
                match.opponent2 &&
                match.opponent1.result !== "win" &&
                match.opponent2.result !== "win",
            );

            return (
              <div
                key={round.id}
                className={matches.length > 0 ? "stack md-plus" : "stack"}
              >
                <RoundHeader
                  roundId={round.id}
                  name={`Round ${round.number}`}
                  bestOf={bestOf}
                  showInfos={someMatchOngoing}
                  maps={round.maps}
                />
                <div className="stack horizontal md flex-wrap">
                  {matches.length === 0 ? (
                    <div className="text-lighter text-md font-bold">
                      Waiting for the previous round to finish
                    </div>
                  ) : null}
                  {matches.map((match) => {
                    if (!match.opponent1 || !match.opponent2) {
                      return null;
                    }

                    return (
                      <Match
                        key={match.id}
                        match={match}
                        roundNumber={round.number}
                        isPreview={bracket.preview}
                        showSimulation={false}
                        bracket={bracket}
                        type="groups"
                        group={selectedGroup.groupName.split(" ")[1]}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* <PlacementsTable
              bracket={bracket}
              groupId={groupId}
              allMatchesFinished={allMatchesFinished}
            /> */}
      </div>
    </div>
  );
}

function getGroups(bracket: BracketType) {
  const result: Array<{
    groupName: string;
    matches: MatchType[];
    groupId: number;
  }> = [];

  for (const group of bracket.data.group) {
    const matches = bracket.data.match.filter(
      (match) => match.group_id === group.id,
    );

    result.push({
      groupName: `Group ${groupNumberToLetter(group.number)}`,
      matches,
      groupId: group.id,
    });
  }

  return result;
}

// xxx: PlacementsTable
// function PlacementsTable({
//   groupId,
//   bracket,
//   allMatchesFinished,
// }: {
//   groupId: number;
//   bracket: BracketType;
//   allMatchesFinished: boolean;
// }) {
//   const _standings = bracket
//     .currentStandings(true)
//     .filter((s) => s.groupId === groupId);

//   const missingTeams = bracket.data.match.reduce((acc, cur) => {
//     if (cur.group_id !== groupId) return acc;

//     if (
//       cur.opponent1?.id &&
//       !_standings.some((s) => s.team.id === cur.opponent1!.id) &&
//       !acc.includes(cur.opponent1.id)
//     ) {
//       acc.push(cur.opponent1.id);
//     }

//     if (
//       cur.opponent2?.id &&
//       !_standings.some((s) => s.team.id === cur.opponent2!.id) &&
//       !acc.includes(cur.opponent2.id)
//     ) {
//       acc.push(cur.opponent2.id);
//     }

//     return acc;
//   }, [] as number[]);

//   const standings = _standings
//     .concat(
//       missingTeams.map((id) => ({
//         team: bracket.tournament.teamById(id)!,
//         stats: {
//           mapLosses: 0,
//           mapWins: 0,
//           points: 0,
//           setLosses: 0,
//           setWins: 0,
//           winsAgainstTied: 0,
//         },
//         placement: Math.max(..._standings.map((s) => s.placement)) + 1,
//         groupId,
//       })),
//     )
//     .sort((a, b) => {
//       if (a.placement === b.placement && a.team.seed && b.team.seed) {
//         return a.team.seed - b.team.seed;
//       }

//       return a.placement - b.placement;
//     });

//   const destinationBracket = (placement: number) =>
//     bracket.tournament.brackets.find(
//       (b) =>
//         b.id !== bracket.id &&
//         b.sources?.some(
//           (s) => s.bracketIdx === 0 && s.placements.includes(placement),
//         ),
//     );

//   return (
//     <table className="rr__placements-table" cellSpacing={0}>
//       <thead>
//         <tr>
//           <th>Team</th>
//           <th>
//             <abbr title="Set wins and losses">W/L</abbr>
//           </th>
//           <th>
//             <abbr title="Wins against tied opponents">TB</abbr>
//           </th>
//           <th>
//             <abbr title="Map wins and losses">W/L (M)</abbr>
//           </th>
//           <th>
//             <abbr title="Score summed up">Scr</abbr>
//           </th>
//           <th>Seed</th>
//           <th />
//         </tr>
//       </thead>
//       <tbody>
//         {standings.map((s, i) => {
//           const stats = s.stats!;
//           if (!stats) {
//             logger.error("No stats for team", s.team);
//             return null;
//           }

//           const team = bracket.tournament.teamById(s.team.id);

//           const dest = destinationBracket(i + 1);

//           return (
//             <tr key={s.team.id}>
//               <td>
//                 <Link
//                   to={tournamentTeamPage({
//                     tournamentId: bracket.tournament.ctx.id,
//                     tournamentTeamId: s.team.id,
//                   })}
//                 >
//                   {s.team.name}
//                 </Link>
//               </td>
//               <td>
//                 <span>
//                   {stats.setWins}/{stats.setLosses}
//                 </span>
//               </td>
//               <td>
//                 <span>{stats.winsAgainstTied}</span>
//               </td>
//               <td>
//                 <span>
//                   {stats.mapWins}/{stats.mapLosses}
//                 </span>
//               </td>
//               <td>
//                 <span>{stats.points}</span>
//               </td>
//               <td>{team?.seed}</td>
//               {dest ? (
//                 <td
//                   className={clsx({
//                     "italic text-lighter": !allMatchesFinished,
//                   })}
//                 >
//                   <span>→ {dest.name}</span>
//                 </td>
//               ) : null}
//             </tr>
//           );
//         })}
//       </tbody>
//     </table>
//   );
// }
