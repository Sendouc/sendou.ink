import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useMatches,
  useSearchParams,
} from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import Chart from "~/components/Chart";
import {
  ModeImage,
  StageImage,
  TierImage,
  WeaponImage,
} from "~/components/Image";
import { Pagination } from "~/components/Pagination";
import { Popover } from "~/components/Popover";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { Tab, Tabs } from "~/components/Tabs";
import { AlertIcon } from "~/components/icons/Alert";
import { TopTenPlayer } from "~/features/leaderboards/components/TopTenPlayer";
import { playerTopTenPlacement } from "~/features/leaderboards/leaderboards-utils";
import { ordinalToSp } from "~/features/mmr";
import {
  currentMMRByUserId,
  seasonAllMMRByUserId,
} from "~/features/mmr/queries/seasonAllMMRByUserId.server";
import {
  allSeasons,
  currentOrPreviousSeason,
  seasonObject,
} from "~/features/mmr/season";
import { userSkills } from "~/features/mmr/tiered.server";
import { seasonMapWinrateByUserId } from "~/features/sendouq/queries/seasonMapWinrateByUserId.server";
import {
  seasonMatchesByUserId,
  seasonMatchesByUserIdPagesCount,
} from "~/features/sendouq/queries/seasonMatchesByUserId.server";
import { seasonReportedWeaponsByUserId } from "~/features/sendouq/queries/seasonReportedWeaponsByUserId.server";
import { seasonSetWinrateByUserId } from "~/features/sendouq/queries/seasonSetWinrateByUserId.server";
import { seasonStagesByUserId } from "~/features/sendouq/queries/seasonStagesByUserId.server";
import { seasonsMatesEnemiesByUserId } from "~/features/sendouq/queries/seasonsMatesEnemiesByUserId.server";
import { useWeaponUsage } from "~/hooks/swr";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useTranslation } from "~/hooks/useTranslation";
import {
  stageIds,
  type ModeShort,
  type StageId,
} from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { atOrError } from "~/utils/arrays";
import { databaseTimestampToDate } from "~/utils/dates";
import { cutToNDecimalPlaces } from "~/utils/number";
import { notFoundIfFalsy } from "~/utils/remix";
import { sendouQMatchPage, userSeasonsPage } from "~/utils/urls";
import { userParamsSchema, type UserPageLoaderData } from "./u.$identifier";
import * as UserRepository from "~/features/user-page/UserRepository.server";

export const seasonsSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  info: z.enum(["weapons", "stages", "mates", "enemies"]).default("weapons"),
  season: z.coerce
    .number()
    .default(currentOrPreviousSeason(new Date())!.nth)
    .refine((nth) => allSeasons(new Date()).includes(nth)),
});

export const loader = async ({ params, request }: LoaderArgs) => {
  const { identifier } = userParamsSchema.parse(params);
  const parsedSearchParams = seasonsSearchParamsSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  const { info, page, season } = parsedSearchParams.success
    ? parsedSearchParams.data
    : seasonsSearchParamsSchema.parse({});

  const user = notFoundIfFalsy(
    await UserRepository.identifierToUserId(identifier),
  );

  const { tier } = (await userSkills(season)).userSkills[user.id] ?? {
    approximate: false,
    ordinal: 0,
    tier: { isPlus: false, name: "IRON" },
  };

  return {
    currentOrdinal: currentMMRByUserId({ season, userId: user.id }),
    winrates: {
      maps: seasonMapWinrateByUserId({ season, userId: user.id }),
      sets: seasonSetWinrateByUserId({ season, userId: user.id }),
    },
    skills: seasonAllMMRByUserId({ season, userId: user.id }),
    tier,
    matches: {
      value: seasonMatchesByUserId({ season, userId: user.id, page }),
      currentPage: page,
      pages: seasonMatchesByUserIdPagesCount({ season, userId: user.id }),
    },
    season,
    info: {
      currentTab: info,
      stages:
        info === "stages"
          ? seasonStagesByUserId({ season, userId: user.id })
          : null,
      weapons:
        info === "weapons"
          ? seasonReportedWeaponsByUserId({ season, userId: user.id })
          : null,
      players:
        info === "enemies" || info === "mates"
          ? seasonsMatesEnemiesByUserId({
              season,
              userId: user.id,
              type: info === "enemies" ? "ENEMY" : "MATE",
            })
          : null,
    },
  };
};

// xxx: turf war to stages
// xxx: tentative next to skill tier
const DAYS_WITH_SKILL_NEEDED_TO_SHOW_POWER_CHART = 2;
export default function UserSeasonsPage() {
  const data = useLoaderData<typeof loader>();

  const tabLink = (tab: string) =>
    `?info=${tab}&page=${data.matches.currentPage}&season=${data.season}`;

  if (data.matches.value.length === 0) {
    return (
      <div className="stack lg half-width">
        <SeasonHeader />
        <div className="text-lg text-lighter font-semi-bold text-center mt-2">
          This user has not played SendouQ or ranked tournaments this season
        </div>
      </div>
    );
  }

  return (
    <div className="stack lg half-width">
      <SeasonHeader />
      {data.currentOrdinal ? (
        <div className="stack md">
          <Rank currentOrdinal={data.currentOrdinal} />
          {data.winrates.maps.wins + data.winrates.maps.losses > 0 ? (
            <Winrates />
          ) : null}
          {data.skills.length >= DAYS_WITH_SKILL_NEEDED_TO_SHOW_POWER_CHART ? (
            <PowerChart />
          ) : null}
        </div>
      ) : null}
      <div className="mt-4">
        <SubNav secondary>
          <SubNavLink
            to={tabLink("weapons")}
            secondary
            controlled
            active={data.info.currentTab === "weapons"}
          >
            Weapons
          </SubNavLink>
          <SubNavLink
            to={tabLink("stages")}
            secondary
            controlled
            active={data.info.currentTab === "stages"}
          >
            Stages
          </SubNavLink>
          <SubNavLink
            to={tabLink("mates")}
            secondary
            controlled
            active={data.info.currentTab === "mates"}
          >
            Teammates
          </SubNavLink>
          <SubNavLink
            to={tabLink("enemies")}
            secondary
            controlled
            active={data.info.currentTab === "enemies"}
          >
            Opponents
          </SubNavLink>
        </SubNav>
        <div className="u__season__info-container">
          {data.info.weapons ? <Weapons weapons={data.info.weapons} /> : null}
          {data.info.stages ? <Stages stages={data.info.stages} /> : null}
          {data.info.players ? <Players players={data.info.players} /> : null}
        </div>
      </div>
      <Matches />
    </div>
  );
}

function SeasonHeader() {
  const data = useLoaderData<typeof loader>();
  const isMounted = useIsMounted();
  const { starts, ends } = seasonObject(data.season);

  const isDifferentYears =
    new Date(starts).getFullYear() !== new Date(ends).getFullYear();

  return (
    <div>
      <div className="stack horizontal xs">
        {allSeasons(new Date()).map((s) => {
          const isActive = s === data.season;

          return (
            <Link
              to={`?season=${s}`}
              key={s}
              className={clsx("text-xl font-bold", {
                "text-lighter": !isActive,
                "text-main-forced": isActive,
              })}
            >
              {isActive ? "Season " : "S"}
              {s}
            </Link>
          );
        })}
      </div>
      <div className={clsx("text-sm text-lighter", { invisible: !isMounted })}>
        {isMounted ? (
          <>
            {new Date(starts).toLocaleString("en", {
              day: "numeric",
              month: "long",
              year: isDifferentYears ? "numeric" : undefined,
            })}{" "}
            -{" "}
            {new Date(ends).toLocaleString("en", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </>
        ) : (
          "0"
        )}
      </div>
    </div>
  );
}

function Winrates() {
  const data = useLoaderData<typeof loader>();

  const winrate = (wins: number, losses: number) =>
    Math.round((wins / (wins + losses)) * 100);

  return (
    <div className="stack horizontal sm">
      <div className="u__season__winrate">
        <span className="text-theme text-xxs">Sets</span>{" "}
        {data.winrates.sets.wins}W {data.winrates.sets.losses}L (
        {winrate(data.winrates.sets.wins, data.winrates.sets.losses)}%)
      </div>
      <div className="u__season__winrate">
        <span className="text-theme text-xxs">Maps</span>{" "}
        {data.winrates.maps.wins}W {data.winrates.maps.losses}L (
        {winrate(data.winrates.maps.wins, data.winrates.maps.losses)}%)
      </div>
    </div>
  );
}

function Rank({ currentOrdinal }: { currentOrdinal: number }) {
  const data = useLoaderData<typeof loader>();
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const parentRouteData = parentRoute.data as UserPageLoaderData;

  const maxOrdinal = Math.max(...data.skills.map((s) => s.ordinal));

  const peakAndCurrentSame = currentOrdinal === maxOrdinal;

  const topTenPlacement = playerTopTenPlacement({
    season: data.season,
    userId: parentRouteData.id,
  });

  return (
    <div className="stack horizontal items-center justify-center sm">
      <TierImage tier={data.tier} />
      <div>
        <div className="text-xl font-bold">
          {data.tier.name}
          {data.tier.isPlus ? "+" : ""}
        </div>
        <div className="text-lg font-bold">{ordinalToSp(currentOrdinal)}SP</div>
        {!peakAndCurrentSame ? (
          <div className="text-lighter text-sm">
            Peak {ordinalToSp(maxOrdinal)}SP
          </div>
        ) : null}
        {topTenPlacement ? (
          <TopTenPlayer
            small
            placement={topTenPlacement}
            season={data.season}
          />
        ) : null}
      </div>
    </div>
  );
}

const now = new Date();
function PowerChart() {
  const data = useLoaderData<typeof loader>();

  const chartOptions = React.useMemo(() => {
    return [
      {
        label: "SP",
        data: data.skills.map((s) => {
          // hack to force shorter bottom axis text
          const date = new Date(s.date);
          date.setFullYear(now.getFullYear());
          return {
            primary: date,
            secondary: ordinalToSp(s.ordinal),
          };
        }),
      },
    ];
  }, [data]);

  return <Chart options={chartOptions as any} />;
}

const MIN_DEGREE = 5;
const WEAPONS_TO_SHOW = 9;
function Weapons({
  weapons,
}: {
  weapons: NonNullable<SerializeFrom<typeof loader>["info"]["weapons"]>;
}) {
  const { t } = useTranslation(["weapons"]);

  const slicedWeapons = weapons.slice(0, WEAPONS_TO_SHOW);

  const totalCount = weapons.reduce((acc, cur) => cur.count + acc, 0);
  const percentage = (count: number) =>
    cutToNDecimalPlaces((count / totalCount) * 100);
  const countToDegree = (count: number) =>
    Math.max((count / totalCount) * 360, MIN_DEGREE);

  const restCount =
    totalCount - slicedWeapons.reduce((acc, cur) => cur.count + acc, 0);
  const restWeaponsCount = weapons.length - WEAPONS_TO_SHOW;

  return (
    <div className="stack sm horizontal justify-center flex-wrap">
      {weapons.length === 0 ? (
        <div className="text-lighter font-bold my-4">
          No reported weapons yet
        </div>
      ) : null}
      {slicedWeapons.map(({ count, weaponSplId }) => (
        <WeaponCircle
          key={weaponSplId}
          degrees={countToDegree(count)}
          count={count}
        >
          <WeaponImage
            weaponSplId={weaponSplId}
            variant="build"
            size={42}
            title={`${t(`weapons:MAIN_${weaponSplId}`)} (${percentage(
              count,
            )}%)`}
          />
        </WeaponCircle>
      ))}
      {restWeaponsCount > 0 ? (
        <WeaponCircle degrees={countToDegree(restCount)}>
          +{restWeaponsCount}
        </WeaponCircle>
      ) : null}
    </div>
  );
}

function Stages({
  stages,
}: {
  stages: NonNullable<SerializeFrom<typeof loader>["info"]["stages"]>;
}) {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["game-misc"]);
  const parentPageData = atOrError(useMatches(), -2).data as UserPageLoaderData;

  return (
    <div className="stack horizontal justify-center md flex-wrap">
      {stageIds.map((id) => {
        return (
          <div key={id} className="stack sm">
            <StageImage stageId={id} height={48} className="rounded" />
            {rankedModesShort.map((mode) => {
              const stats = stages[id]?.[mode];
              const winPercentage = stats
                ? cutToNDecimalPlaces(
                    (stats.wins / (stats.wins + stats.losses)) * 100,
                  )
                : "";
              const infoText = `${t(`game-misc:MODE_SHORT_${mode}`)} ${t(
                `game-misc:STAGE_${id}`,
              )} ${winPercentage}${winPercentage ? "%" : ""}`;

              return (
                <Popover
                  key={mode}
                  buttonChildren={
                    <div className="stack horizontal items-center xs text-xs font-semi-bold text-main-forced">
                      <ModeImage mode={mode} size={18} title={infoText} />
                      {stats ? (
                        <div>
                          {stats.wins}W {stats.losses}L
                        </div>
                      ) : null}
                    </div>
                  }
                >
                  <StageWeaponUsageStats
                    modeShort={mode}
                    season={data.season}
                    stageId={id}
                    userId={parentPageData.id}
                  />
                </Popover>
              );
            })}
          </div>
        );
      })}
      <div className="text-xs text-lighter font-semi-bold">
        Click a row to show weapon usage stats
      </div>
    </div>
  );
}

function StageWeaponUsageStats(props: {
  userId: number;
  season: number;
  modeShort: ModeShort;
  stageId: StageId;
}) {
  const { t } = useTranslation(["game-misc"]);
  const [tab, setTab] = React.useState<"SELF" | "MATE" | "ENEMY">("SELF");
  const { weaponUsage, isLoading } = useWeaponUsage(props);

  if (isLoading) {
    return (
      <div className="u__season__weapon-usage__container items-center justify-center text-lighter p-2">
        Loading...
      </div>
    );
  }

  const usages = (weaponUsage ?? []).filter((u) => u.type === tab);

  if (usages.length === 0) {
    return (
      <div className="u__season__weapon-usage__container items-center justify-center text-lighter p-2">
        No reported weapons yet
      </div>
    );
  }

  return (
    <div className="u__season__weapon-usage__container">
      <div className="stack horizontal sm text-xs items-center justify-center">
        <ModeImage mode={props.modeShort} width={18} />
        {t(`game-misc:STAGE_${props.stageId}`)}
      </div>
      <Tabs compact className="mb-0">
        <Tab active={tab === "SELF"} onClick={() => setTab("SELF")}>
          Self
        </Tab>
        <Tab active={tab === "MATE"} onClick={() => setTab("MATE")}>
          Teammates
        </Tab>
        <Tab active={tab === "ENEMY"} onClick={() => setTab("ENEMY")}>
          Opponents
        </Tab>
      </Tabs>
      <div className="u__season__weapon-usage__weapons-container">
        {usages.map((u) => {
          const winrate = cutToNDecimalPlaces(
            (u.wins / (u.wins + u.losses)) * 100,
          );

          return (
            <div key={u.weaponSplId}>
              <WeaponImage
                weaponSplId={u.weaponSplId}
                variant="build"
                width={48}
                className="u__season__weapon-usage__weapon"
              />
              <div
                className={clsx("text-xs font-bold", {
                  "text-success": winrate >= 50,
                  "text-warning": winrate < 50,
                })}
              >
                {winrate}%
              </div>
              <div className="text-xs">{u.wins} W</div>
              <div className="text-xs">{u.losses} L</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Players({
  players,
}: {
  players: NonNullable<SerializeFrom<typeof loader>["info"]["players"]>;
}) {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="stack md horizontal justify-center flex-wrap">
      {players.map((player) => {
        const setWinRate = Math.round(
          (player.setWins / (player.setWins + player.setLosses)) * 100,
        );
        const mapWinRate = Math.round(
          (player.mapWins / (player.mapWins + player.mapLosses)) * 100,
        );
        return (
          <div key={player.user.id} className="stack">
            <Link
              to={userSeasonsPage({ user: player.user, season: data.season })}
              className="u__season__player-name"
            >
              <Avatar user={player.user} size="xs" className="mx-auto" />
              {player.user.discordName}
            </Link>
            <div
              className={clsx("text-xs font-bold", {
                "text-success": setWinRate >= 50,
                "text-warning": setWinRate < 50,
              })}
            >
              {setWinRate}% ({mapWinRate}%)
            </div>
            <div className="text-xs">
              {player.setWins} ({player.mapWins}) W
            </div>
            <div className="text-xs">
              {player.setLosses} ({player.mapLosses}) L
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeaponCircle({
  degrees,
  children,
  count,
}: {
  degrees: number;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="u__season__weapon-container">
      <div className="u__season__weapon-border__outer-static" />
      <div
        className="u__season__weapon-border__outer"
        style={{ "--degree": `${degrees}deg` } as any}
      >
        <div className="u__season__weapon-border__inner">{children}</div>
      </div>
      {count ? <div className="u__season__weapon-count">{count}</div> : null}
    </div>
  );
}

function Matches() {
  const isMounted = useIsMounted();
  const data = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();
  const ref = React.useRef<HTMLDivElement>(null);

  const setPage = (page: number) => {
    setSearchParams({ page: String(page), season: String(data.season) });
  };

  React.useEffect(() => {
    if (data.matches.currentPage === 1) return;
    ref.current?.scrollIntoView({
      block: "center",
    });
  }, [data.matches.currentPage]);

  let lastDayRendered: number | null = null;
  return (
    <div>
      <div ref={ref} />
      <div className="stack lg">
        <div className="stack">
          {data.matches.value.map((match) => {
            const day = databaseTimestampToDate(match.createdAt).getDate();
            const shouldRenderDateHeader = day !== lastDayRendered;
            lastDayRendered = day;

            return (
              <React.Fragment key={match.id}>
                <div
                  className={clsx(
                    "text-xs font-semi-bold text-theme-secondary",
                    {
                      invisible: !isMounted || !shouldRenderDateHeader,
                    },
                  )}
                >
                  {isMounted
                    ? databaseTimestampToDate(match.createdAt).toLocaleString(
                        "en",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "t"}
                </div>
                <Match match={match} />
              </React.Fragment>
            );
          })}
        </div>
        {data.matches.pages > 1 ? (
          <Pagination
            currentPage={data.matches.currentPage}
            pagesCount={data.matches.pages}
            nextPage={() => setPage(data.matches.currentPage + 1)}
            previousPage={() => setPage(data.matches.currentPage - 1)}
            setPage={(page) => setPage(page)}
          />
        ) : null}
      </div>
    </div>
  );
}

function Match({
  match,
}: {
  match: SerializeFrom<typeof loader>["matches"]["value"][0];
}) {
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const userPageData = parentRoute.data as UserPageLoaderData;
  const userId = userPageData.id;

  const score = match.winnerGroupIds.reduce(
    (acc, cur) => [
      acc[0] + (cur === match.alphaGroupId ? 1 : 0),
      acc[1] + (cur === match.bravoGroupId ? 1 : 0),
    ],
    [0, 0],
  );

  // score when match has not yet been played or was canceled
  const specialScoreMarking = () => {
    if (score[0] + score[1] === 0) return match.isLocked ? "-" : " ";

    return null;
  };

  const reserveWeaponSpace =
    match.groupAlphaMembers.some((m) => m.weaponSplId) ||
    match.groupBravoMembers.some((m) => m.weaponSplId);

  // make sure user's team is always on the top
  const rows = match.groupAlphaMembers.some((m) => m.id === userId)
    ? [
        <MatchMembersRow
          key="alpha"
          members={match.groupAlphaMembers}
          score={specialScoreMarking() ?? score[0]}
          reserveWeaponSpace={reserveWeaponSpace}
        />,
        <MatchMembersRow
          key="bravo"
          members={match.groupBravoMembers}
          score={specialScoreMarking() ?? score[1]}
          reserveWeaponSpace={reserveWeaponSpace}
        />,
      ]
    : [
        <MatchMembersRow
          key="bravo"
          members={match.groupBravoMembers}
          score={specialScoreMarking() ?? score[1]}
          reserveWeaponSpace={reserveWeaponSpace}
        />,
        <MatchMembersRow
          key="alpha"
          members={match.groupAlphaMembers}
          score={specialScoreMarking() ?? score[0]}
          reserveWeaponSpace={reserveWeaponSpace}
        />,
      ];

  return (
    <Link to={sendouQMatchPage(match.id)} className="u__season__match">
      {rows}
      {!match.isLocked ? (
        <div className="stack horizontal sm text-xs text-lighter items-center justify-center">
          <AlertIcon className="text-warning w-24px" />
          This match has not been processed yet
        </div>
      ) : null}
    </Link>
  );
}

function MatchMembersRow({
  score,
  members,
  reserveWeaponSpace,
}: {
  score: React.ReactNode;
  members: SerializeFrom<
    typeof loader
  >["matches"]["value"][0]["groupAlphaMembers"];
  reserveWeaponSpace: boolean;
}) {
  return (
    <div className="stack horizontal xs items-center">
      {members.map((member) => {
        return (
          <div key={member.discordId} className="u__season__match__user">
            <Avatar user={member} size="xxs" />
            <span className="u__season__match__user__name">
              {member.discordName}
            </span>
            {typeof member.weaponSplId === "number" ? (
              <WeaponImage
                weaponSplId={member.weaponSplId}
                variant="badge"
                size={28}
              />
            ) : reserveWeaponSpace ? (
              <WeaponImage
                weaponSplId={0}
                variant="badge"
                size={28}
                className="invisible"
              />
            ) : null}
          </div>
        );
      })}
      <div className="u__season__match__score">{score}</div>
    </div>
  );
}
