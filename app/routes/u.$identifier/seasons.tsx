import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { TierImage } from "~/components/Image";
import { db } from "~/db";
import { ordinalToSp } from "~/features/mmr";
import { seasonAllMMRByUserId } from "~/features/mmr/queries/seasonAllMMRByUserId.server";
import { seasonObject } from "~/features/mmr/season";
import { userSkills } from "~/features/mmr/tiered";
import { useIsMounted } from "~/hooks/useIsMounted";
import { notFoundIfFalsy } from "~/utils/remix";
import { userParamsSchema } from "../u.$identifier";

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
  };
};

// xxx: support switching seasons
export default function UserSeasonsPage() {
  return (
    <div className="stack lg">
      <SeasonHeader />
      <Rank />
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

// xxx: hide peak if same as current
function Rank() {
  const data = useLoaderData<typeof loader>();

  const maxOrdinal = Math.max(...data.skills.map((s) => s.ordinal));

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
        <div className="text-lighter text-sm">
          Peak {ordinalToSp(maxOrdinal)}SP
        </div>
      </div>
    </div>
  );
}
