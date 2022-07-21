import { type LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import * as React from "react";
import { Main } from "~/components/Main";
import styles from "~/styles/calendar.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function CalendarPage() {
  const [weeks, setWeeks] = React.useState([
    "10",
    "Last",
    "This",
    "Next",
    "14",
  ]);

  return (
    <Main>
      <div className="flex justify-center">
        <div className="calendar__weeks">
          {weeks.map((week) => (
            <div
              key={week}
              onClick={() => setWeeks(["Last", "This", "Next", "14", "15"])}
              className="calendar__week"
            >
              <div>
                {week} <br />
                Week
              </div>
              <div className="calendar__event-count">×12</div>
            </div>
          ))}
        </div>
      </div>
    </Main>
  );
}
