import { NavLink, Outlet } from "solid-app-router";
import { InfoBanner } from "./InfoBanner";
import s from "../styles/TournamentPage.module.css";

export default function TournamentsPage() {
  return (
    <div class={s.container}>
      <InfoBanner />
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
          Teams (23)
        </NavLink>
        <NavLink class={s.navLink} href="streams">
          Streams (4)
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
