import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { upcomingVoting } from "~/core/plus";
import { db } from "~/db";
import type * as plusSuggestions from "~/db/models/plusSuggestions.server";
import { useUser } from "~/hooks/useUser";
import { requireUser } from "~/utils/remix";
import styles from "~/styles/plus.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

interface PlusLoaderData {
  suggestions?: plusSuggestions.FindResult;
  suggestedForTiers: number[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  return json<PlusLoaderData>({
    suggestions: db.plusSuggestions.find({
      ...upcomingVoting(new Date()),
      plusTier: user.plusTier,
    }),
    suggestedForTiers: db.plusSuggestions.tiersSuggestedFor({
      ...upcomingVoting(new Date()),
      userId: user.id,
    }),
  });
};

export default function PlusPage() {
  const data = useLoaderData<PlusLoaderData>();

  if (!data.suggestions) {
    return <SuggestedForInfo />;
  }

  return (
    <div>
      <SuggestedForInfo />
    </div>
  );
}

function SuggestedForInfo() {
  const data = useLoaderData<PlusLoaderData>();
  const user = useUser();

  // no need to show anything if they can't be suggested anyway...
  if (user?.plusTier === 1) {
    return null;
  }

  if (data.suggestedForTiers.length === 0) {
    return (
      <div className="plus__suggested-info-text">
        You are not suggested yet this month.
      </div>
    );
  }

  return (
    <div className="plus__suggested-info-text">
      You are suggested for{" "}
      {data.suggestedForTiers.map((tier) => `+${tier}`).join(" and ")} this
      month.
    </div>
  );
}
