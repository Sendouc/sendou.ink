import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import { Link, Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { Button, LinkButton } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { TrashIcon } from "~/components/icons/Trash";
import { nextNonCompletedVoting } from "~/modules/plus-server";
import { db } from "~/db";
import type * as plusSuggestions from "~/db/models/plusSuggestions/queries.server";
import type { PlusSuggestion, User } from "~/db/types";
import { getUser, requireUser, useUser } from "~/modules/auth";
import {
  canAddCommentToSuggestionFE,
  canSuggestNewUserFE,
  canDeleteComment,
  canDeleteSuggestionOfThemselves,
  isFirstSuggestion,
} from "~/permissions";
import { parseRequestFormData, validate } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { discordFullName } from "~/utils/strings";
import { actualNumber } from "~/utils/zod";
import { FAQ_PAGE, LOG_IN_URL, userPage } from "~/utils/urls";
import { RelativeTime } from "~/components/RelativeTime";
import { databaseTimestampToDate } from "~/utils/dates";
import { PLUS_TIERS } from "~/constants";
import { assertUnreachable } from "~/utils/types";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Plus Server suggestions"),
    description: "This month's suggestions for +1, +2 and +3.",
  };
};

const suggestionActionSchema = z.union([
  z.object({
    _action: z.literal("DELETE_COMMENT"),
    suggestionId: z.preprocess(actualNumber, z.number()),
  }),
  z.object({
    _action: z.literal("DELETE_SUGGESTION_OF_THEMSELVES"),
    tier: z.preprocess(
      actualNumber,
      z
        .number()
        .min(Math.min(...PLUS_TIERS))
        .max(Math.max(...PLUS_TIERS))
    ),
  }),
]);

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: suggestionActionSchema,
  });
  const user = await requireUser(request);

  switch (data._action) {
    case "DELETE_COMMENT": {
      const suggestions = db.plusSuggestions.findVisibleForUser({
        ...nextNonCompletedVoting(new Date()),
        plusTier: user.plusTier,
      });

      const flattenedSuggestedUserInfo = Object.entries(suggestions ?? {})
        .flatMap(([tier, suggestions]) =>
          suggestions.map(({ suggestedUser, suggestions }) => ({
            tier: Number(tier),
            suggestedUser,
            suggestions,
          }))
        )
        .find(({ suggestions }) =>
          suggestions.some((s) => s.id === data.suggestionId)
        );

      validate(suggestions);
      validate(flattenedSuggestedUserInfo);
      validate(
        canDeleteComment({
          user,
          author: flattenedSuggestedUserInfo.suggestions.find(
            (s) => s.id === data.suggestionId
          )!.author,
          suggestionId: data.suggestionId,
          suggestions,
        })
      );

      const suggestionHasComments =
        flattenedSuggestedUserInfo.suggestions.length > 1;
      if (
        suggestionHasComments &&
        isFirstSuggestion({ suggestionId: data.suggestionId, suggestions })
      ) {
        // admin only action
        db.plusSuggestions.deleteSuggestionWithComments({
          ...nextNonCompletedVoting(new Date()),
          tier: flattenedSuggestedUserInfo.tier,
          suggestedId: flattenedSuggestedUserInfo.suggestedUser.id,
        });
      } else {
        db.plusSuggestions.del(data.suggestionId);
      }

      break;
    }
    case "DELETE_SUGGESTION_OF_THEMSELVES": {
      validate(canDeleteSuggestionOfThemselves());

      db.plusSuggestions.deleteAll({ suggestedId: user.id, tier: data.tier });

      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export interface PlusSuggestionsLoaderData {
  suggestions?: plusSuggestions.FindVisibleForUser;
  suggestedForTiers: number[];
}

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) => {
  // only reload if form submission not when user changes tabs
  return Boolean(submission);
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  if (!user) {
    return json<PlusSuggestionsLoaderData>({
      suggestedForTiers: [],
    });
  }

  return json<PlusSuggestionsLoaderData>({
    suggestions: db.plusSuggestions.findVisibleForUser({
      ...nextNonCompletedVoting(new Date()),
      plusTier: user.plusTier,
    }),
    suggestedForTiers: db.plusSuggestions.tiersSuggestedFor({
      ...nextNonCompletedVoting(new Date()),
      userId: user.id,
    }),
  });
};

export default function PlusSuggestionsPage() {
  const data = useLoaderData<PlusSuggestionsLoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();
  const tierVisible = searchParamsToLegalTier(searchParams, data.suggestions);

  const handleTierChange = (tier: string) => {
    setSearchParams({ tier });
  };

  if (!user) {
    return (
      <form className="text-sm" action={LOG_IN_URL} method="post">
        <p className="button-text-paragraph">
          To view your suggestion status{" "}
          <Button type="submit" variant="minimal">
            log in
          </Button>
        </p>
        <p className="mt-2">
          Not sure what the Plus Server is about? Read the{" "}
          <Link to={FAQ_PAGE}>FAQ</Link>
        </p>
      </form>
    );
  }

  if (!data.suggestions) {
    return <SuggestedForInfo />;
  }

  const visibleSuggestions =
    tierVisible && data.suggestions[tierVisible]
      ? data.suggestions[tierVisible]
      : [];
  invariant(visibleSuggestions);

  return (
    <>
      <Outlet />
      <div className="plus__container">
        <div className="stack md">
          <SuggestedForInfo hideText />
          <div className="stack lg">
            <div
              className={clsx("plus__top-container", {
                "content-centered": !canSuggestNewUserFE({
                  user,
                  suggestions: data.suggestions,
                }),
              })}
            >
              <div className="plus__radios">
                {Object.entries(data.suggestions)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([tier, suggestions]) => {
                    const id = String(tier);
                    return (
                      <div key={id} className="plus__radio-container">
                        <label htmlFor={id} className="plus__radio-label">
                          +{tier}{" "}
                          <span className="plus__users-count">
                            ({suggestions.length})
                          </span>
                        </label>
                        <input
                          id={id}
                          name="tier"
                          type="radio"
                          checked={tierVisible === tier}
                          onChange={() => handleTierChange(tier)}
                          data-cy={`plus${tier}-radio`}
                        />
                      </div>
                    );
                  })}
              </div>
              {canSuggestNewUserFE({ user, suggestions: data.suggestions }) ? (
                // TODO: resetScroll={false} https://twitter.com/ryanflorence/status/1527775882797907969
                <LinkButton
                  to={`new${tierVisible ? `?tier=${tierVisible}` : ""}`}
                  prefetch="render"
                  tiny
                >
                  Suggest
                </LinkButton>
              ) : null}
            </div>
            <div className="stack lg">
              {visibleSuggestions.map((u) => {
                invariant(tierVisible);
                return (
                  <SuggestedUser
                    key={`${u.suggestedUser.id}-${tierVisible}`}
                    suggested={u}
                    tier={tierVisible}
                  />
                );
              })}
              {visibleSuggestions.length === 0 ? (
                <div className="plus__suggested-info-text text-center">
                  No suggestions yet
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function searchParamsToLegalTier(
  searchParams: URLSearchParams,
  suggestions?: plusSuggestions.FindVisibleForUser
) {
  const tierFromSearchParams = searchParams.get("tier");
  if (
    !tierFromSearchParams ||
    !suggestions ||
    !suggestions[tierFromSearchParams]
  ) {
    return tierVisibleInitialState(suggestions);
  }

  return tierFromSearchParams;
}

function tierVisibleInitialState(
  suggestions?: plusSuggestions.FindVisibleForUser
) {
  if (!suggestions || Object.keys(suggestions).length === 0) return;
  return String(Math.min(...Object.keys(suggestions).map(Number)));
}

function SuggestedForInfo({ hideText = false }: { hideText?: boolean }) {
  const data = useLoaderData<PlusSuggestionsLoaderData>();
  const user = useUser();

  // no need to show anything if they can't be suggested anyway...
  if (user?.plusTier === 1) {
    return null;
  }

  if (data.suggestedForTiers.length === 0) {
    if (hideText) return null;

    return (
      <div className="plus__suggested-info-text">
        You are not suggested yet this month.
      </div>
    );
  }

  return (
    <div className="stack md">
      {!hideText ? (
        <div className="plus__suggested-info-text">
          You are suggested to{" "}
          {data.suggestedForTiers.map((tier) => `+${tier}`).join(" and ")} this
          month.
        </div>
      ) : null}
      {canDeleteSuggestionOfThemselves() ? (
        <div className="stack horizontal md">
          {data.suggestedForTiers.map((tier) => (
            <FormWithConfirm
              key={tier}
              fields={[
                ["_action", "DELETE_SUGGESTION_OF_THEMSELVES"],
                ["tier", tier],
              ]}
              dialogHeading={`Delete your suggestion to +${tier}? You won't appear in next voting.`}
            >
              <Button key={tier} tiny variant="destructive" type="submit">
                Delete your +{tier} suggestion
              </Button>
            </FormWithConfirm>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SuggestedUser({
  suggested,
  tier,
}: {
  suggested: plusSuggestions.FindVisibleForUserSuggestedUserInfo;
  tier: string;
}) {
  const data = useLoaderData<PlusSuggestionsLoaderData>();
  const user = useUser();

  invariant(data.suggestions);

  return (
    <div className="stack md">
      <div className="plus__suggested-user-info">
        <Avatar user={suggested.suggestedUser} size="md" />
        <h2>
          <Link className="all-unset" to={userPage(suggested.suggestedUser)}>
            {suggested.suggestedUser.discordName}
          </Link>
        </h2>
        {canAddCommentToSuggestionFE({
          user,
          suggestions: data.suggestions,
          suggested: { id: suggested.suggestedUser.id },
          targetPlusTier: Number(tier),
        }) ? (
          // TODO: resetScroll={false} https://twitter.com/ryanflorence/status/1527775882797907969
          <LinkButton
            className="plus__comment-button"
            tiny
            variant="outlined"
            to={`comment/${tier}/${suggested.suggestedUser.id}?tier=${tier}`}
            prefetch="render"
          >
            Comment
          </LinkButton>
        ) : null}
      </div>
      <PlusSuggestionComments
        suggestions={suggested.suggestions}
        deleteButtonArgs={{
          suggested,
          user,
          tier,
          suggestions: data.suggestions,
        }}
      />
    </div>
  );
}

export function PlusSuggestionComments({
  suggestions,
  deleteButtonArgs,
  defaultOpen,
}: {
  suggestions: plusSuggestions.FindVisibleForUserSuggestedUserInfo["suggestions"];
  deleteButtonArgs?: {
    user?: Pick<User, "id" | "discordId">;
    suggestions: plusSuggestions.FindVisibleForUser;
    tier: string;
    suggested: plusSuggestions.FindVisibleForUserSuggestedUserInfo;
  };
  defaultOpen?: true;
}) {
  return (
    <details open={defaultOpen} className="w-full">
      <summary className="plus__view-comments-action">
        Comments ({suggestions.length})
      </summary>
      <div className="stack sm mt-2">
        {suggestions.map((suggestion) => {
          return (
            <fieldset key={suggestion.id} className="plus__comment">
              <legend>{discordFullName(suggestion.author)}</legend>
              {suggestion.text}
              <div className="stack horizontal xs items-center">
                <span className="plus__comment-time">
                  <RelativeTime
                    timestamp={databaseTimestampToDate(
                      suggestion.createdAt
                    ).getTime()}
                  >
                    {suggestion.createdAtRelative}
                  </RelativeTime>
                </span>
                {deleteButtonArgs &&
                canDeleteComment({
                  author: suggestion.author,
                  user: deleteButtonArgs.user,
                  suggestionId: suggestion.id,
                  suggestions: deleteButtonArgs.suggestions,
                }) ? (
                  <CommentDeleteButton
                    suggestionId={suggestion.id}
                    tier={deleteButtonArgs.tier}
                    suggestedDiscordName={
                      deleteButtonArgs.suggested.suggestedUser.discordName
                    }
                    isFirstSuggestion={
                      deleteButtonArgs.suggested.suggestions.length === 1
                    }
                  />
                ) : null}
              </div>
            </fieldset>
          );
        })}
      </div>
    </details>
  );
}

function CommentDeleteButton({
  suggestionId,
  tier,
  suggestedDiscordName,
  isFirstSuggestion = false,
}: {
  suggestionId: PlusSuggestion["id"];
  tier: string;
  suggestedDiscordName: string;
  isFirstSuggestion?: boolean;
}) {
  return (
    <FormWithConfirm
      fields={[
        ["suggestionId", suggestionId],
        ["_action", "DELETE_COMMENT"],
      ]}
      dialogHeading={
        isFirstSuggestion
          ? `Delete your suggestion of ${suggestedDiscordName} to +${tier}?`
          : `Delete your comment to ${suggestedDiscordName}'s +${tier} suggestion?`
      }
    >
      <Button
        className="plus__delete-button"
        icon={<TrashIcon />}
        variant="minimal-destructive"
        aria-label="Delete comment"
      />
    </FormWithConfirm>
  );
}

export const CatchBoundary = Catcher;
