import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { makeTitle } from "~/utils";
import * as Skill from "~/models/Skill.server";
import { LeaderboardEntry, skillsToLeaderboard } from "~/core/mmr/leaderboards";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Leaderboards"),
  };
};

export type LookingLoaderDataGroup = {
  players: LeaderboardEntry[];
};

export const loader: LoaderFunction = async () => {
  // TODO: only get skills of March
  const skills = await Skill.findAll();

  return json<LookingLoaderDataGroup>({ players: skillsToLeaderboard(skills) });
};

export default function LeaderboardsPage() {
  const data = useLoaderData<LookingLoaderDataGroup>();

  console.log({ data });

  return <div>boards lol</div>;
}
