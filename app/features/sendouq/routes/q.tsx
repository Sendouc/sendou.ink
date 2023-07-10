import { Flag } from "~/components/Flag";
import { Main } from "~/components/Main";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import styles from "../q.css";
import type { LinksFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { MAP_LIST_PREFERENCE_OPTIONS } from "../q-constants";
import type { SendouRouteHandle } from "~/utils/remix";
import { ModeImage } from "~/components/Image";
import { assertUnreachable } from "~/utils/types";
import * as React from "react";

export const handle: SendouRouteHandle = {
  i18n: ["q"],
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function QPage() {
  return (
    <Main halfWidth className="stack lg">
      <Clocks />
      <Form className="stack lg">
        <h2 className="q__header">Join the queue!</h2>
        <MapPreference />
      </Form>
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
// xxx: handle SSR
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

function MapPreference() {
  const [value, setValue] = React.useState("NO_PREFERENCE");
  const { t } = useTranslation(["q"]);

  return (
    <div className="stack">
      <label htmlFor="map">Maplist preference</label>
      {MAP_LIST_PREFERENCE_OPTIONS.map((option) => {
        const comparisonSign = (() => {
          switch (option) {
            case "SZ_ONLY":
            case "ALL_MODES_ONLY":
              return null;
            case "NO_PREFERENCE":
              return "=";
            case "PREFER_ALL_MODES":
              return "<";
            case "PREFER_SZ":
              return ">";
            default:
              assertUnreachable(option);
          }
        })();

        return (
          <div key={option} className="stack sm horizontal items-center">
            <input
              type="radio"
              name="mapListPreference"
              id={option}
              value={option}
              checked={value === option}
              onChange={() => setValue(option)}
            />
            <label htmlFor={option} className="q__map-preference-label">
              {option !== "ALL_MODES_ONLY" ? (
                <ModeImage mode="SZ" size={16} />
              ) : null}
              {comparisonSign ? (
                <span className="text-main-forced">{comparisonSign}</span>
              ) : null}
              {option !== "SZ_ONLY" ? (
                <>
                  <ModeImage mode="SZ" size={16} />
                  <ModeImage mode="TC" size={16} />
                  <ModeImage mode="RM" size={16} />
                  <ModeImage mode="CB" size={16} />
                </>
              ) : null}
              {t(`q:mapListPreference.${option}`)}
            </label>
          </div>
        );
      })}
      {value === "SZ_ONLY" || value === "ALL_MODES_ONLY" ? (
        <div className="text-xs text-lighter mt-2">
          {t("q:mapListPreference.note", {
            optionOne:
              value === "SZ_ONLY"
                ? t("q:mapListPreference.ALL_MODES_ONLY")
                : t("q:mapListPreference.SZ_ONLY"),
            optionTwo:
              value === "SZ_ONLY"
                ? t("q:mapListPreference.PREFER_SZ")
                : t("q:mapListPreference.PREFER_ALL_MODES"),
          })}
        </div>
      ) : null}
    </div>
  );
}
