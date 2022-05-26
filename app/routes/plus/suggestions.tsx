import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import { LinkButton } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { upcomingVoting } from "~/core/plus";
import { db } from "~/db";
import type * as plusSuggestions from "~/db/models/plusSuggestions.server";
import { useUser } from "~/hooks/useUser";
import { canAddCommentToSuggestionFE } from "~/permissions";
import styles from "~/styles/plus.css";
import { databaseTimestampToDate } from "~/utils/dates";
import { makeTitle, requireUser } from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
import type { Unpacked } from "~/utils/types";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Plus Server suggestions"),
    description: "This month's suggestions for +1, +2 and +3.",
  };
};

export interface PlusSuggestionsLoaderData {
  suggestions?: plusSuggestions.FindResult;
  suggestedForTiers: number[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  return json<PlusSuggestionsLoaderData>({
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

export default function PlusSuggestionsPage() {
  const data = useLoaderData<PlusSuggestionsLoaderData>();
  const [tierVisible, setTierVisible] = React.useState(
    data.suggestions?.[0].tier ?? 0
  );

  if (!data.suggestions) {
    return <SuggestedForInfo />;
  }

  const visibleSuggestions = data.suggestions.find(
    ({ tier }) => tier === tierVisible
  );
  invariant(visibleSuggestions);

  return (
    <>
      <Outlet />
      <div className="plus__container">
        <SuggestedForInfo />
        <div className="stack md">
          <div className="plus__radios">
            {data.suggestions.map(({ tier, users }) => {
              const id = String(tier);
              return (
                <div key={id} className="plus__radio-container">
                  <label htmlFor={id} className="plus__radio-label">
                    +{tier}{" "}
                    <span className="plus__users-count">({users.length})</span>
                  </label>
                  <input
                    id={id}
                    name="tier"
                    type="radio"
                    checked={tierVisible === tier}
                    onChange={() => setTierVisible(tier)}
                  />
                </div>
              );
            })}
          </div>
          <div className="stack lg">
            {visibleSuggestions.users.map((u) => (
              <SuggestedUser
                key={`${u.info.id}-${tierVisible}`}
                suggested={u}
                tier={tierVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SuggestedForInfo() {
  const data = useLoaderData<PlusSuggestionsLoaderData>();
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

function SuggestedUser({
  suggested,
  tier,
}: {
  suggested: Unpacked<
    Unpacked<NonNullable<PlusSuggestionsLoaderData["suggestions"]>>["users"]
  >;
  tier: number;
}) {
  const data = useLoaderData<PlusSuggestionsLoaderData>();
  const user = useUser();

  invariant(data.suggestions);

  return (
    <div className="stack md">
      <div className="plus__suggested-user-info">
        <Avatar
          discordAvatar={suggested.info.discordAvatar}
          discordId={suggested.info.discordId}
          size="md"
        />
        <h2>{suggested.info.discordName}</h2>
        {canAddCommentToSuggestionFE({
          user,
          suggestions: data.suggestions,
          suggested: { id: suggested.info.id, plusTier: tier },
        }) ? (
          // TODO: resetScroll={false} https://twitter.com/ryanflorence/status/1527775882797907969
          <LinkButton
            className="plus__comment-button"
            tiny
            variant="outlined"
            to={`comment/${tier}/${suggested.info.id}`}
          >
            Comment
          </LinkButton>
        ) : null}
      </div>
      <details>
        <summary className="plus__view-comments-action">
          Comments ({suggested.suggestions.length})
        </summary>
        <div className="stack sm mt-2">
          {suggested.suggestions.map((s) => (
            <fieldset className="plus__comment" key={s.author.id}>
              <legend>{discordFullName(s.author)}</legend>
              {s.text}
              <span className="plus__comment-time">
                {" "}
                ―{" "}
                <time>
                  {databaseTimestampToDate(s.createdAt).toLocaleString()}
                </time>
              </span>
            </fieldset>
          ))}
        </div>
      </details>
    </div>
  );
}

export const CatchBoundary = Catcher;
