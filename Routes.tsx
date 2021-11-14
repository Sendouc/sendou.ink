import { Routes as SolidAppRoutes, Route } from "solid-app-router";
import { lazy } from "solid-js";
import TournamentData from "./scenes/tournament/components/TournamentsPage.data";

const TournamentsPage = lazy(
  () => import("./scenes/tournament/components/TournamentsPage")
);

export function Routes() {
  return (
    <SolidAppRoutes>
      <Route
        path="/to/:identifier"
        element={<TournamentsPage />}
        // TODO: fix type error
        data={TournamentData as any}
      >
        <Route path="/*all" element={() => <>overview</>} />
        <Route path="/map-pool" element={() => <>map pool</>} />
        <Route path="/bracket" element={() => <>bracket</>} />
        <Route path="/teams" element={() => <>teams</>} />
        <Route path="/streams" element={() => <>streams</>} />
      </Route>
      <Route path="/" element={() => <>home!</>} />
      <Route path="/*all" element={() => <>Not found</>} />
    </SolidAppRoutes>
  );
}
