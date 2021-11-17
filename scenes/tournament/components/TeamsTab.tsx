import { createMemo, For, Show } from "solid-js";
import { useTournamentData } from "../TournamentPage.data";
import s from "../styles/TeamsTab.module.css";
import { AvatarWithName } from "../../../components/AvatarWithName";
import type { InferQueryOutput } from "../../../utils/trpc-client";

const sortCaptainFirst = (a: { captain: boolean }, b: { captain: boolean }) => {
  return Number(b.captain) - Number(a.captain);
};

const sortTeamsFullFirst = (a: { members: any[] }, b: { members: any[] }) => {
  const aSortValue = a.members.length >= 4 ? 1 : 0;
  const bSortValue = b.members.length >= 4 ? 1 : 0;

  return bSortValue - aSortValue;
};

export function TeamsTab() {
  const tournament = useTournamentData(1);

  const sortedTeams = createMemo(() =>
    tournament()
      ?.teams.sort(sortTeamsFullFirst)
      .map((team) => {
        return {
          ...team,
          members: team.members.sort(sortCaptainFirst),
        };
      })
  );

  return (
    <div class={s.container}>
      <Show when={sortedTeams()}>{(teams) => <TeamsList teams={teams} />}</Show>
    </div>
  );
}

function TeamsList(p: {
  teams: NonNullable<InferQueryOutput<"tournament.get">>["teams"];
}) {
  if (!p.teams.length) return null;

  return (
    <div>
      <div class={s.teamsContainer}>
        <For each={p.teams}>
          {(team) => (
            <>
              <div class={s.teamName}>{team.name}</div>
              <div class={s.membersContainer}>
                <For each={team.members}>
                  {(data, i) => (
                    <div class={s.member}>
                      <div class={s.orderNumber}>
                        {data.captain ? "C" : i() + 1}
                      </div>
                      <AvatarWithName {...data.member} />
                    </div>
                  )}
                </For>
              </div>
            </>
          )}
        </For>
      </div>
    </div>
  );
}
