import { Flag } from "~/components/Flag";
import { Main } from "~/components/Main";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import styles from "../q.css";
import type { LinksFunction } from "@remix-run/node";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function QPage() {
  return (
    <Main halfWidth>
      <Clocks />
    </Main>
  );
}

const countries = [
  {
    id: 1,
    countryCode: "US",
    timeZone: "America/Los_Angeles",
    city: "Los Angeles",
  },
  { id: 2, countryCode: "US", timeZone: "America/New_York", city: "New York" },
  { id: 3, countryCode: "FR", timeZone: "Europe/Paris", city: "Paris" },
  { id: 4, countryCode: "JP", timeZone: "Asia/Tokyo", city: "Tokyo" },
] as const;
const formatter = (timeZone: string) =>
  new Intl.DateTimeFormat([], {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    weekday: "long",
  });
function Clocks() {
  useAutoRerender();

  return (
    <div className="q__clocks-container">
      {countries.map((country) => {
        return (
          <div key={country.id} className="q__clock">
            <div className="q__clock-country">{country.city}</div>
            <Flag countryCode={country.countryCode} />
            {formatter(country.timeZone).format(new Date())}
          </div>
        );
      })}
    </div>
  );
}
