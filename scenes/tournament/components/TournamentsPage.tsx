import { Outlet, useData } from "solid-app-router";

export default function TournamentsPage() {
  const user = useData<() => string>();

  return (
    <>
      response: "{user()}"
      <p>
        <Outlet />
      </p>
    </>
  );
}
