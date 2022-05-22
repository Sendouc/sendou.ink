import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { upcomingVoting } from "~/core/plus";
import { db } from "~/db";
import type * as plusSuggestions from "~/db/models/plusSuggestions.server";
import { requireUser } from "~/utils/remix";

interface PlusLoaderData {
  suggestions?: plusSuggestions.FindResult;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  return json<PlusLoaderData>({
    suggestions: db.plusSuggestions.find({
      ...upcomingVoting(new Date()),
      plusTier: user.plusTier,
    }),
  });
};

export default function PlusPage() {
  const data = useLoaderData();

  console.log({ data });

  return <div>heyo</div>;
}
