import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useMatches,
  useSearchParams,
} from "@remix-run/react";
import clsx from "clsx";
import {
  ModeImage,
  StageImage,
  TierImage,
  WeaponImage,
} from "~/components/Image";
import { db } from "~/db";
import { ordinalToSp } from "~/features/mmr";
import {
  currentMMRByUserId,
  seasonAllMMRByUserId,
} from "~/features/mmr/queries/seasonAllMMRByUserId.server";
import { currentSeason, seasonObject } from "~/features/mmr/season";
import { userSkills } from "~/features/mmr/tiered.server";
import { useIsMounted } from "~/hooks/useIsMounted";
import { notFoundIfFalsy } from "~/utils/remix";
import { type UserPageLoaderData, userParamsSchema } from "../u.$identifier";
import { seasonReportedWeaponsByUserId } from "~/features/sendouq/queries/seasonReportedWeaponsByUserId.server";
import { useTranslation } from "~/hooks/useTranslation";
import { cutToNDecimalPlaces } from "~/utils/number";
import {
  seasonMatchesByUserId,
  seasonMatchesByUserIdPagesCount,
} from "~/features/sendouq/queries/seasonMatchesByUserId.server";
import { sendouQMatchPage, userSeasonsPage } from "~/utils/urls";
import { Avatar } from "~/components/Avatar";
import invariant from "tiny-invariant";
import { Pagination } from "~/components/Pagination";
import * as React from "react";
import { databaseTimestampToDate } from "~/utils/dates";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { z } from "zod";
import { seasonStagesByUserId } from "~/features/sendouq/queries/seasonStagesByUserId.server";
import {
  type ModeShort,
  type StageId,
  stageIds,
} from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { seasonsMatesEnemiesByUserId } from "~/features/sendouq/queries/seasonsMatesEnemiesByUserId.server";
import Chart from "~/components/Chart";
import { AlertIcon } from "~/components/icons/Alert";
import { seasonMapWinrateByUserId } from "~/features/sendouq/queries/seasonMapWinrateByUserId.server";
import { seasonSetWinrateByUserId } from "~/features/sendouq/queries/seasonSetWinrateByUserId.server";
import { Popover } from "~/components/Popover";
import { useWeaponUsage } from "~/hooks/swr";

export const seasonsSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  info: z.enum(["weapons", "stages", "mates", "enemies"]).default("weapons"),
});

export const loader = async ({ params, request }: LoaderArgs) => {
  const { identifier } = userParamsSchema.parse(params);
  const parsedSearchParams = seasonsSearchParamsSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  const { info, page } = parsedSearchParams.success
    ? parsedSearchParams.data
    : seasonsSearchParamsSchema.parse({});

  // TODO: handle it not being current season ("freshUserSkills" has ! that throws)
  notFoundIfFalsy(currentSeason(new Date()));

  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  const { tier } = (await userSkills()).userSkills[user.id] ?? {
    approximate: false,
    ordinal: 0,
    tier: { isPlus: false, name: "IRON" },
  };

  return {
    currentOrdinal: currentMMRByUserId({ season: 0, userId: user.id }),
    winrates: {
      maps: seasonMapWinrateByUserId({ season: 0, userId: user.id }),
      sets: seasonSetWinrateByUserId({ season: 0, userId: user.id }),
    },
    skills: seasonAllMMRByUserId({ season: 0, userId: user.id }),
    tier,
    matches: {
      value: seasonMatchesByUserId({ season: 0, userId: user.id, page }),
      currentPage: page,
      pages: seasonMatchesByUserIdPagesCount({ season: 0, userId: user.id }),
    },
    info: {
      currentTab: info,
      stages:
        info === "stages"
          ? seasonStagesByUserId({ season: 0, userId: user.id })
          : null,
      weapons:
        info === "weapons"
          ? seasonReportedWeaponsByUserId({ season: 0, userId: user.id })
          : null,
      players:
        info === "enemies" || info === "mates"
          ? seasonsMatesEnemiesByUserId({
              season: 0,
              userId: user.id,
              type: info === "enemies" ? "ENEMY" : "MATE",
            })
          : null,
    },
  };
};

export default function UserSeasonsPage() {
  const data = useLoaderData<typeof loader>();

  const tabLink = (tab: string) =>
    `?info=${tab}&page=${data.matches.currentPage}`;

  if (data.matches.value.length === 0) {
    return (
      <div className="text-lg text-lighter font-semi-bold text-center mt-2">
        This user has not played SendouQ or ranked tournaments yet.
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
          {data.skills.length >= 3 ? <PowerChart /> : null}
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
  const isMounted = useIsMounted();
  const { starts, ends } = seasonObject(0);

  const isDifferentYears =
    new Date(starts).getFullYear() !== new Date(ends).getFullYear();

  return (
    <div>
      <h2 className="text-xl font-bold">Season 0</h2>
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

  const maxOrdinal = Math.max(...data.skills.map((s) => s.ordinal));

  const peakAndCurrentSame = currentOrdinal === maxOrdinal;

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
        label: "Power",
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
              count
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
  const { t } = useTranslation(["game-misc"]);
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
                    (stats.wins / (stats.wins + stats.losses)) * 100
                  )
                : "";
              const infoText = `${t(`game-misc:MODE_SHORT_${mode}`)} ${t(
                `game-misc:STAGE_${id}`
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
                  // triggerClassName="minimal tiny build__small-text"
                >
                  <StageWeaponUsageStats
                    modeShort={mode}
                    // TODO: dynamic season
                    season={0}
                    stageId={id}
                    // xxx: fix
                    userId={1}
                  />
                </Popover>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function StageWeaponUsageStats(props: {
  userId: number;
  season: number;
  modeShort: ModeShort;
  stageId: StageId;
}) {
  const { weaponUsage, isLoading } = useWeaponUsage(props);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <pre>{JSON.stringify(weaponUsage, null, 2)}</pre>
    </div>
  );
}

function Players({
  players,
}: {
  players: NonNullable<SerializeFrom<typeof loader>["info"]["players"]>;
}) {
  return (
    <div className="stack md horizontal justify-center flex-wrap">
      {players.map((player) => {
        const setWinRate = Math.round(
          (player.setWins / (player.setWins + player.setLosses)) * 100
        );
        const mapWinRate = Math.round(
          (player.mapWins / (player.mapWins + player.mapLosses)) * 100
        );
        return (
          <div key={player.user.id} className="stack">
            <Link
              to={userSeasonsPage({ user: player.user })}
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
    setSearchParams({ page: String(page) });
  };

  React.useEffect(() => {
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
                    }
                  )}
                >
                  {isMounted
                    ? databaseTimestampToDate(match.createdAt).toLocaleString(
                        "en",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        }
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
    [0, 0]
  );

  // make sure user's team is always on the top
  const rows = match.groupAlphaMembers.some((m) => m.id === userId)
    ? [
        <MatchMembersRow
          key="alpha"
          members={match.groupAlphaMembers}
          score={score[0]}
        />,
        <MatchMembersRow
          key="bravo"
          members={match.groupBravoMembers}
          score={score[1]}
        />,
      ]
    : [
        <MatchMembersRow
          key="bravo"
          members={match.groupBravoMembers}
          score={score[1]}
        />,
        <MatchMembersRow
          key="alpha"
          members={match.groupAlphaMembers}
          score={score[0]}
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
}: {
  score: number;
  members: SerializeFrom<
    typeof loader
  >["matches"]["value"][0]["groupAlphaMembers"];
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
            ) : null}
          </div>
        );
      })}
      <div className="u__season__match__score">{score}</div>
    </div>
  );
}
