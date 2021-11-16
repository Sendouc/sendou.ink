import { createMemo, For, Show } from "solid-js";
import { useTournamentData } from "../TournamentPage.data";
import s from "../styles/TeamsTab.module.css";
import { AvatarWithName } from "../../../components/AvatarWithName";
import type { InferQueryOutput } from "../../../utils/trpc-client";

export function TeamsTab() {
  const tournament = useTournamentData(1);

  const sortCaptainFirst = (
    a: { captain: boolean },
    b: { captain: boolean }
  ) => {
    return Number(b.captain) - Number(a.captain);
  };

  const completeTeams = createMemo(() =>
    tournament()
      ?.teams.filter((team) => team.members.length >= 4)
      .map((team) => {
        return {
          ...team,
          members: team.members.sort(sortCaptainFirst),
        };
      })
  );

  const inCompleteTeams = createMemo(() =>
    tournament()
      ?.teams.filter((team) => team.members.length < 4)
      .map((team) => {
        return {
          ...team,
          members: team.members.sort(sortCaptainFirst),
        };
      })
  );

  return (
    <div class={s.container}>
      <Show when={completeTeams()}>
        {(teams) => <TeamsList teams={teams} title="Full teams" />}
      </Show>
      <Show when={inCompleteTeams()}>
        {(teams) => <TeamsList teams={teams} title="Incomplete teams" />}
      </Show>
    </div>
  );
}

function TeamsList(p: {
  teams: NonNullable<InferQueryOutput<"tournament.get">>["teams"];
  title: string;
}) {
  if (!p.teams.length) return null;

  return (
    <div>
      <h2 class={s.teamListTitle}>
        {p.title} ({p.teams.length})
      </h2>
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
                        {data.captain ? "C" : i()}
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
