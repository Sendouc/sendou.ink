import { NavLink, Outlet, useData } from "solid-app-router";
import { InfoBanner } from "./InfoBanner";
import s from "../styles/TournamentPage.module.css";
import type { ITournamentData } from "../TournamentPage.data";
import { Show } from "solid-js";
import { ActionSection } from "./ActionSection";

export default function TournamentsPage() {
  const [tournament] = useData<ITournamentData>();

  return (
    <div class={s.container}>
      <InfoBanner />
      <ActionSection />
      <Show when={tournament()}>
        {(tournament) => (
          <div style={{ "--tabs-count": 5 }} class={s.linksContainer}>
            <NavLink class={s.navLink} href="overview">
              Overview
            </NavLink>
            <NavLink class={s.navLink} href="map-pool">
              Map Pool
            </NavLink>
            <NavLink class={s.navLink} href="bracket">
              Bracket
            </NavLink>
            <NavLink class={s.navLink} href="teams">
              Teams ({tournament.teams.length})
            </NavLink>
            <NavLink class={s.navLink} href="streams">
              Streams (4)
            </NavLink>
          </div>
        )}
      </Show>
      <Outlet />
    </div>
  );
}
