import type { LinksFunction } from "remix";
import { Outlet } from "remix";
import { Button } from "~/components/Button";
import styles from "~/styles/tournament-admin.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function AdminPage() {
  return (
    <>
      <div className="tournament__admin__buttons-container">
        {/* Don't show when check in is not concluded + secure route */}
        <Button>Start tournament</Button>
        {/* TODO: */}
        <Button variant="outlined">Edit tournament</Button>
      </div>
      <Outlet />
    </>
  );
}
