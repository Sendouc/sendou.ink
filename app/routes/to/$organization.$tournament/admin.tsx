import type { LinksFunction } from "remix";
import { Button } from "~/components/Button";
import { AdminTeamControls } from "~/components/tournament/AdminTeamControls";
import styles from "~/styles/tournament-admin.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function AdminPage() {
  return (
    <>
      <div className="tournament__admin__buttons-container">
        <Button>Start tournament</Button>
        <Button variant="outlined">Edit tournament</Button>
      </div>
      <AdminTeamControls />
    </>
  );
}
