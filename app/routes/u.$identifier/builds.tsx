import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BuildCard } from "~/components/BuildCard";
import { Main } from "~/components/Main";
import { db } from "~/db";
import { notFoundIfFalsy } from "~/utils/remix";
import { userParamsSchema } from "../u.$identifier";

export const handle = {
  i18n: "weapons",
};

export const loader = ({ params }: LoaderArgs) => {
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  const builds = db.builds.buildsByUserId(user.id);

  return json({ builds });
};

export default function UserBuildsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="builds-container">
        {data.builds.map((build) => (
          <BuildCard
            key={build.id}
            title={build.title}
            description={build.description}
            headGearSplId={build.headGearSplId}
            clothesGearSplId={build.clothesGearSplId}
            shoesGearSplId={build.shoesGearSplId}
            modes={build.modes}
            updatedAt={build.updatedAt}
            abilities={build.abilities}
            weapons={build.weapons}
          />
        ))}
      </div>
    </Main>
  );
}
