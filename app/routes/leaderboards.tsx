import {
  json,
  Link,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  useLoaderData,
} from "remix";
import { makeTitle } from "~/utils";
import * as Skill from "~/models/Skill.server";
import { LeaderboardEntry, skillsToLeaderboard } from "~/core/mmr/leaderboards";
import { playerMatchHistoryPage } from "~/utils/urls";
import styles from "~/styles/leaderboard.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Leaderboards"),
  };
};

export type LookingLoaderDataGroup = {
  players: LeaderboardEntry[];
};

export const loader: LoaderFunction = async () => {
  // TODO: dynamic
  const skills = await Skill.findAllByMonth({ month: 3, year: 2022 });
  return json<LookingLoaderDataGroup>({ players: skillsToLeaderboard(skills) });
};

export default function LeaderboardsPage() {
  const data = useLoaderData<LookingLoaderDataGroup>();

  let placementToRender = 1;
  let lastMMR = 0;
  return (
    <div className="leaderboard__container">
      <h1 className="leaderboard__title">March 2022 SP Leaderboard</h1>
      <table className="leaderboard__table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th className="leaderboard__table-header-cell">Peak SP</th>
            <th className="leaderboard__table-header-cell">Sets</th>
          </tr>
        </thead>
        <tbody>
          {data.players.map((p, i) => {
            if (p.MMR !== lastMMR) {
              lastMMR = p.MMR;
              placementToRender = i + 1;
            }

            return (
              <tr key={p.user.id} className="leaderboard__table__row">
                <td>{placementToRender}</td>
                <td>
                  <Link to={playerMatchHistoryPage(p.user.id)}>
                    {p.user.discordName}
                  </Link>
                </td>
                <td className="leaderboard__table__small-text-cell">{p.MMR}</td>
                <td className="leaderboard__table__small-text-cell secondary">
                  {p.entries}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
