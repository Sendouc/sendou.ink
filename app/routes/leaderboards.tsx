import {
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { monthNames } from "~/constants";
import {
  LeaderboardEntry,
  monthYearIsValid,
  monthYearOptions,
  skillsToLeaderboard,
} from "~/core/mmr/leaderboards";
import * as Skill from "~/models/Skill.server";
import styles from "~/styles/leaderboard.css";
import { makeTitle } from "~/utils";
import { cached } from "~/utils/redis.server";
import { playerMatchHistoryPage } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Leaderboards"),
  };
};

export interface LeaderboardsLoaderData {
  players: LeaderboardEntry[];
  month: number;
  year: number;
}

async function getLeaderboard(input: { month: number; year: number }) {
  const skills = await Skill.findAllByMonth(input);
  return skillsToLeaderboard(skills);
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  let month = Number(url.searchParams.get("month"));
  let year = Number(url.searchParams.get("year"));

  if (!monthYearIsValid({ month, year })) {
    month = new Date().getMonth() + 1;
    year = new Date().getFullYear();
  }

  const players = await cached({
    key: `sp-leaderboard-${month}-${year}`,
    call: () => getLeaderboard({ month, year }),
    secondsToExpire: 60 * 30, // half an hour
  });

  return json<LeaderboardsLoaderData>({ players, month, year });
};

export default function LeaderboardsPage() {
  const data = useLoaderData<LeaderboardsLoaderData>();
  const submit = useSubmit();

  let placementToRender = 1;
  let lastMMR = 0;
  return (
    <div className="leaderboard__container">
      <div className="leaderboard__header-container">
        <h1 className="leaderboard__title">SP Leaderboard</h1>
        <Form method="get">
          {/* TODO: fix (with flushSync?) before 2023 :D */}
          <input type="hidden" name="year" value={2022} />

          <select
            className="leaderboard__select"
            name="month"
            onChange={(e) => submit(e.currentTarget.form)}
            defaultValue={data.month}
          >
            {monthYearOptions().map((option) => (
              <option key={JSON.stringify(option)} value={option.month}>
                {monthNames[option.month]} {option.year}
              </option>
            ))}
          </select>
        </Form>
      </div>
      {data.players.length > 0 ? (
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
                  <td className="leaderboard__table__small-text-cell">
                    {p.MMR}
                  </td>
                  <td className="leaderboard__table__small-text-cell secondary">
                    {p.entries}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="leaderboard__no-players">
          No players yet for this ranking period
        </div>
      )}
    </div>
  );
}
