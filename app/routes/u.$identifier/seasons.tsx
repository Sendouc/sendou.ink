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
import { seasonAllMMRByUserId } from "~/features/mmr/queries/seasonAllMMRByUserId.server";
import { seasonObject } from "~/features/mmr/season";
import { userSkills } from "~/features/mmr/tiered";
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
import { sendouQMatchPage } from "~/utils/urls";
import { Avatar } from "~/components/Avatar";
import invariant from "tiny-invariant";
import { Pagination } from "~/components/Pagination";
import * as React from "react";
import { databaseTimestampToDate } from "~/utils/dates";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { z } from "zod";
import { seasonStagesByUserId } from "~/features/sendouq/queries/seasonStagesByUserId.server";
import { stageIds } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";

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

  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  const skills = seasonAllMMRByUserId({ season: 0, userId: user.id });
  const { tier } = (await userSkills()).userSkills[user.id] ?? {
    approximate: false,
    ordinal: 0,
    tier: { isPlus: false, name: "IRON" },
  };

  return {
    skills,
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
    },
  };
};

export default function UserSeasonsPage() {
  const data = useLoaderData<typeof loader>();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [data]);

  const tabLink = (tab: string) =>
    `?info=${tab}&page=${data.matches.currentPage}`;

  return (
    <div className="stack lg half-width">
      <SeasonHeader />
      <Rank />
      <div>
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
            Enemies
          </SubNavLink>
        </SubNav>
        <div className="u__season__info-container">
          {data.info.weapons ? <Weapons weapons={data.info.weapons} /> : null}
          {data.info.stages ? <Stages stages={data.info.stages} /> : null}
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

function Rank() {
  const data = useLoaderData<typeof loader>();

  const maxOrdinal = Math.max(...data.skills.map((s) => s.ordinal));

  const peakAndCurrentSame = data.skills[0].ordinal === maxOrdinal;

  return (
    <div className="stack horizontal items-center justify-center sm">
      <TierImage tier={data.tier} />
      <div>
        <div className="text-xl font-bold">
          {data.tier.name}
          {data.tier.isPlus ? "+" : ""}
        </div>
        <div className="text-lg font-bold">
          {ordinalToSp(data.skills[0].ordinal)}SP
        </div>
        {!peakAndCurrentSame ? (
          <div className="text-lighter text-sm">
            Peak {ordinalToSp(maxOrdinal)}SP
          </div>
        ) : null}
      </div>
    </div>
  );
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
                <div
                  key={mode}
                  className="stack horizontal items-center xs text-xs font-semi-bold"
                >
                  <ModeImage mode={mode} size={18} title={infoText} />
                  {stats ? (
                    <div>
                      {stats.wins}W {stats.losses}L
                    </div>
                  ) : null}
                </div>
              );
            })}
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

  const setPage = (page: number) => {
    setSearchParams({ page: String(page) });
  };

  let lastDayRendered: number | null = null;
  return (
    <div className="stack lg">
      <div className="stack">
        {data.matches.value.map((match) => {
          const day = databaseTimestampToDate(match.createdAt).getDate();
          const shouldRenderDateHeader = day !== lastDayRendered;
          lastDayRendered = day;

          return (
            <React.Fragment key={match.id}>
              <div
                className={clsx("text-xs font-semi-bold text-theme-secondary", {
                  invisible: !isMounted || !shouldRenderDateHeader,
                })}
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
      <Pagination
        currentPage={data.matches.currentPage}
        pagesCount={data.matches.pages}
        nextPage={() => setPage(data.matches.currentPage + 1)}
        previousPage={() => setPage(data.matches.currentPage - 1)}
        setPage={(page) => setPage(page)}
      />
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
            {member.weaponSplId ? (
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
