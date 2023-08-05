import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { TierImage, WeaponImage } from "~/components/Image";
import { db } from "~/db";
import { ordinalToSp } from "~/features/mmr";
import { seasonAllMMRByUserId } from "~/features/mmr/queries/seasonAllMMRByUserId.server";
import { seasonObject } from "~/features/mmr/season";
import { userSkills } from "~/features/mmr/tiered";
import { useIsMounted } from "~/hooks/useIsMounted";
import { notFoundIfFalsy } from "~/utils/remix";
import { userParamsSchema } from "../u.$identifier";
import { seasonReportedWeaponsByUserId } from "~/features/sendouq/queries/seasonReportedWeaponsByUserId.server";
import { useTranslation } from "~/hooks/useTranslation";
import { cutToNDecimalPlaces } from "~/utils/number";

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
  };
};

// xxx: support switching seasons
export default function UserSeasonsPage() {
  return (
    <div className="stack lg">
      <SeasonHeader />
      <Rank />
      <Weapons />
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
