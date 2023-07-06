import type { LoaderArgs } from "@remix-run/node";
import { userParamsSchema } from "../u.$identifier";
import { notFoundIfFalsy } from "~/utils/remix";
import { db } from "~/db";
import { artsByUserId, ArtGrid } from "~/features/art";
import { useLoaderData } from "@remix-run/react";
import * as React from "react";

export const loader = ({ params }: LoaderArgs) => {
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  return {
    arts: artsByUserId(user.id),
  };
};

export default function UserArtPage() {
  const data = useLoaderData<typeof loader>();
  const [type, setType] = React.useState<"ALL" | "MADE-BY" | "MADE-OF">("ALL");

  const hasBothArtMadeByAndMadeOf =
    data.arts.some((a) => a.author) && data.arts.some((a) => !a.author);

  const arts =
    type === "ALL"
      ? data.arts
      : type === "MADE-BY"
      ? data.arts.filter((a) => !a.author)
      : data.arts.filter((a) => a.author);

  return (
    <div className="stack md">
      {hasBothArtMadeByAndMadeOf ? (
        <div className="stack md horizontal">
          <div className="stack xs horizontal items-center">
            <input
              type="radio"
              id="all"
              checked={type === "ALL"}
              onChange={() => setType("ALL")}
            />
            <label htmlFor="all" className="mb-0">
              All
            </label>
          </div>
          <div className="stack xs horizontal items-center">
            <input
              type="radio"
              id="made-by"
              checked={type === "MADE-BY"}
              onChange={() => setType("MADE-BY")}
            />
            <label htmlFor="made-by" className="mb-0">
              Art made by
            </label>
          </div>
          <div className="stack xs horizontal items-center">
            <input
              type="radio"
              id="made-of"
              checked={type === "MADE-OF"}
              onChange={() => setType("MADE-OF")}
            />
            <label htmlFor="made-of" className="mb-0">
              Art made of
            </label>
          </div>
        </div>
      ) : null}
      <ArtGrid arts={arts} />
    </div>
  );
}
