import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { Link, useLoaderData, useMatches } from "@remix-run/react";
import clsx from "clsx";
import { TierImage, WeaponImage } from "~/components/Image";
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
import { seasonMatchesByUserId } from "~/features/sendouq/queries/seasonMatchesByUserId.server";
import { sendouQMatchPage } from "~/utils/urls";
import { Avatar } from "~/components/Avatar";
import invariant from "tiny-invariant";

export const loader = async ({ params }: LoaderArgs) => {
  const { identifier } = userParamsSchema.parse(params);
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
    weapons: seasonReportedWeaponsByUserId({ season: 0, userId: user.id }),
    matches: seasonMatchesByUserId({ season: 0, userId: user.id }),
  };
};

export default function UserSeasonsPage() {
  return (
    <div className="stack lg half-width">
      <SeasonHeader />
      <Rank />
      <Weapons />
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
function Weapons() {
  const { t } = useTranslation(["weapons"]);
  const data = useLoaderData<typeof loader>();

  const weapons = data.weapons.slice(0, WEAPONS_TO_SHOW);

  const totalCount = data.weapons.reduce((acc, cur) => cur.count + acc, 0);
  const percentage = (count: number) =>
    cutToNDecimalPlaces((count / totalCount) * 100);
  const countToDegree = (count: number) =>
    Math.max((count / totalCount) * 360, MIN_DEGREE);

  const restCount =
    totalCount - weapons.reduce((acc, cur) => cur.count + acc, 0);
  const restWeaponsCount = data.weapons.length - WEAPONS_TO_SHOW;

  return (
    <div className="stack sm horizontal justify-center flex-wrap">
      {weapons.map(({ count, weaponSplId }) => (
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

// xxx: date headers
function Matches() {
  const data = useLoaderData<typeof loader>();

  // xxx: pagination
  return (
    <div className="stack sm">
      {data.matches.map((match) => (
        <Match key={match.id} match={match} />
      ))}
    </div>
  );
}

function Match({
  match,
}: {
  match: SerializeFrom<typeof loader>["matches"][0];
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
  members: SerializeFrom<typeof loader>["matches"][0]["groupAlphaMembers"];
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
