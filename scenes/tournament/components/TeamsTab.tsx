import { createMemo, For, Show } from "solid-js";
import type { ITournamentData } from "../TournamentPage.data";
import s from "../styles/TeamsTab.module.css";
import { AvatarWithName } from "../../../components/AvatarWithName";
import type { InferQueryOutput } from "../../../utils/trpc-client";
import { useUser } from "../../../utils/UserContext";
import { useData } from "solid-app-router";

const sortCaptainFirst = (a: { captain: boolean }, b: { captain: boolean }) => {
  return Number(b.captain) - Number(a.captain);
};

const sortOwnTeamsAndFullTeamsFirst =
  (userId?: number) =>
  (
    a: { members: { member: { id: number } }[] },
    b: { members: { member: { id: number } }[] }
  ) => {
    if (userId) {
      const aSortValue = Number(
        a.members.some(({ member }) => userId === member.id)
      );
      const bSortValue = Number(
        b.members.some(({ member }) => userId === member.id)
      );

      if (aSortValue !== bSortValue) return bSortValue - aSortValue;
    }

    const aSortValue = a.members.length >= 4 ? 1 : 0;
    const bSortValue = b.members.length >= 4 ? 1 : 0;

    return bSortValue - aSortValue;
  };

export function TeamsTab() {
  const [tournament] = useData<ITournamentData>(1);
  const user = useUser();

  const sortedTeams = createMemo(() =>
    tournament()
      ?.teams.sort(sortOwnTeamsAndFullTeamsFirst(user()?.id))
      .map((team) => {
        return {
          ...team,
          members: team.members.sort(sortCaptainFirst),
        };
      })
  );

  // TODO: looks kinda bad on mobile
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
