import { Outlet } from "solid-app-router";
import { useTournamentData } from "./TournamentsPage.data";

export default function TournamentsPage() {
  const tournament = useTournamentData();

  return (
    <>
      response: "<pre>{JSON.stringify(tournament(), null, 2)}</pre>"
      <p>
        <Outlet />
      </p>
    </>
  );
}
