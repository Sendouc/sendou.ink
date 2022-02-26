import clsx from "clsx";
import { Link } from "react-router-dom";
import { LinksFunction, NavLink, Outlet, useLocation } from "remix";
import styles from "~/styles/play-layout.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function PlayLayoutPage() {
  const location = useLocation();

  const playActive =
    !location.pathname.includes("rules") &&
    !location.pathname.includes("settings");

  return (
    <div className="container">
      <div className="play-layout__link-container">
        <NavLink className="play-layout__link" to="rules" end>
          Rules
        </NavLink>
        <Link
          className={clsx("play-layout__link", { active: playActive })}
          to="/play"
        >
          Play
        </Link>
        <NavLink className="play-layout__link invisible" to="settings" end>
          Settings
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
