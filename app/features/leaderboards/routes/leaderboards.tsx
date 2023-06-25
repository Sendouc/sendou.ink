import type { LinksFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Avatar } from "~/components/Avatar";
import { Main } from "~/components/Main";
import { discordFullName } from "~/utils/strings";
import { LEADERBOARDS_PAGE, navIconUrl, userPage } from "~/utils/urls";
import styles from "../../top-search/top-search.css";
import {
  type UserSPLeaderboardItem,
  userSPLeaderboard,
} from "../queries/userSPLeaderboard.server";
import type { SendouRouteHandle } from "~/utils/remix";

export const handle: SendouRouteHandle = {
  i18n: ["vods"],
  breadcrumb: () => ({
    imgPath: navIconUrl("leaderboards"),
    href: LEADERBOARDS_PAGE,
    type: "IMAGE",
  }),
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = () => {
  return {
    leaderboard: userSPLeaderboard(),
  };
};

export default function LeaderboardsPage() {
  // const [searchParams, setSearchParams] = useSearchParams();
  const data = useLoaderData<typeof loader>();

  // const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  // const [month, year, mode, region] = event.target.value.split("-");
  // invariant(month, "month is missing");
  // invariant(year, "year is missing");
  // invariant(mode, "mode is missing");
  // invariant(region, "region is missing");
  // setSearchParams({
  //   month,
  //   year,
  //   mode,
  //   region,
  // });
  // }

  // const selectValue = `${
  //   searchParams.get("month") ?? data.availableMonthYears[0]!.month
  // }-${searchParams.get("year") ?? data.availableMonthYears[0]!.year}-${
  //   searchParams.get("mode") ?? "SZ"
  // }-${searchParams.get("region") ?? "WEST"}`;

  return (
    <Main halfWidth className="stack lg">
      {/* <select
        className="text-sm"
        onChange={handleSelectChange}
        value={selectValue}
        data-testid="xsearch-select"
      >
        {selectOptions(data.availableMonthYears).map((group) => (
          <optgroup
            key={group[0]!.id}
            label={t(`common:divisions.${group[0]!.region}`)}
          >
            {group.map((option) => (
              <option
                key={option.id}
                value={`${option.span.value.month}-${option.span.value.year}-${option.mode}-${option.region}`}
              >
                {option.span.from.month}/{option.span.from.year} -{" "}
                {option.span.to.month}/{option.span.to.year} /{" "}
                {t(`game-misc:MODE_SHORT_${option.mode}`)} /{" "}
                {t(`common:divisions.${option.region}`)}
              </option>
            ))}
          </optgroup>
        ))}
      </select> */}
      <PlayersTable entries={data.leaderboard} />
    </Main>
  );
}

function PlayersTable({ entries }: { entries: UserSPLeaderboardItem[] }) {
  let rank = 0;
  let previousPower = -1;
  return (
    <div className="placements__table">
      {entries.map((entry, i) => {
        if (previousPower !== entry.power) {
          rank = i + 1;
          previousPower = entry.power;
        }

        return (
          <Link
            to={userPage(entry)}
            key={entry.entryId}
            className="placements__table__row"
          >
            <div className="placements__table__inner-row">
              <div className="placements__table__rank">{rank}</div>
              <div>
                <Avatar size="xxs" user={entry} />
              </div>
              <div>{discordFullName(entry)}</div>
              <div className="placements__table__power">{entry.power}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
