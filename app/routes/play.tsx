import clsx from "clsx";
import { LinksFunction } from "@remix-run/node";
import { Link, NavLink, Outlet, useLocation } from "@remix-run/react";
import { useUser } from "~/hooks/common";
import styles from "~/styles/play-layout.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function PlayLayoutPage() {
  const location = useLocation();
  const user = useUser();

  const playActive =
    !location.pathname.includes("rules") &&
    !location.pathname.includes("settings") &&
    !location.pathname.includes("history");

  return (
    <div>
      <div className="play-layout__link-container">
        <Link
          className={clsx("play-layout__link", { active: playActive })}
          to="/play"
        >
          Play
        </Link>
        <NavLink className="play-layout__link" to="rules" end>
          Rules
        </NavLink>
        {user && (
          <NavLink className="play-layout__link" to={`history/${user.id}`} end>
            Match history
          </NavLink>
        )}
        {user && (
          <NavLink className="play-layout__link" to="settings" end>
            Settings
          </NavLink>
        )}
      </div>
      <Outlet />
    </div>
  );
}
