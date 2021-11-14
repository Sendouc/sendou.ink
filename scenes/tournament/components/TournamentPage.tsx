import { Outlet } from "solid-app-router";
import { InfoBanner } from "./InfoBanner";
import s from "../styles/TournamentPage.module.css";

export default function TournamentsPage() {
  return (
    <div class={s.container}>
      <InfoBanner />
      <Outlet />
    </div>
  );
}
