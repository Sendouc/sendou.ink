import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { lastCompletedVoting } from "~/modules/plus-server";
import { db } from "~/db";
import type { PlusVotingResultByMonthYear } from "~/db/models/plusVotes/queries.server";
import type { PlusVotingResult, UserWithPlusTier } from "~/db/types";
import { roundToNDecimalPlaces } from "~/utils/number";
import { makeTitle } from "~/utils/strings";
import styles from "~/styles/plus-history.css";
import { discordFullName } from "~/utils/strings";
import { PLUS_SERVER_DISCORD_URL, userPage } from "~/utils/urls";
import clsx from "clsx";
import { getUser } from "~/modules/auth";
import { isAtLeastFiveDollarTierPatreon } from "~/utils/users";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  const { month, year } = lastCompletedVoting(new Date());

  return {
    title: makeTitle("Plus Server voting history"),
    description: `Plus Server voting results for ${month + 1}/${year}`,
  };
};

interface PlusVotingResultsLoaderData {
  results?: PlusVotingResultByMonthYear["results"];
  ownScores?: {
    score?: PlusVotingResult["score"];
    tier: PlusVotingResult["tier"];
    passedVoting: PlusVotingResult["passedVoting"];
    betterThan?: number;
  }[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const { results, scores } = db.plusVotes.resultsByMontYear(
    lastCompletedVoting(new Date())
  );

  return json<PlusVotingResultsLoaderData>({
    results,
    ownScores: ownScores({ scores, user }),
  });
};

function databaseAvgToPercentage(score: number) {
  const scoreNormalized = score + 1;

  return roundToNDecimalPlaces((scoreNormalized / 2) * 100);
}

function ownScores({
  scores,
  user,
}: {
  scores: PlusVotingResultByMonthYear["scores"];
  user?: UserWithPlusTier;
}) {
  return scores
    .filter((score) => {
      return score.userId === user?.id;
    })
    .map((score) => {
      const showScore =
        (score.wasSuggested && !score.passedVoting) ||
        isAtLeastFiveDollarTierPatreon(user);

      const sameTierButNotOwn = (
        filteredScore: Pick<PlusVotingResult, "tier"> & { userId: number }
      ) =>
        filteredScore.tier === score.tier && filteredScore.userId !== user?.id;

      const result: {
        tier: number;
        score?: number;
        passedVoting: number;
        betterThan?: number;
      } = {
        tier: score.tier,
        score: databaseAvgToPercentage(score.score),
        passedVoting: score.passedVoting,
        betterThan: roundToNDecimalPlaces(
          (scores
            .filter(sameTierButNotOwn)
            .filter((otherScore) => otherScore.score <= score.score).length /
            scores.filter(sameTierButNotOwn).length) *
            100
        ),
      };

      if (!showScore) result.score = undefined;
      if (!isAtLeastFiveDollarTierPatreon(user) || !result.passedVoting) {
        result.betterThan = undefined;
      }

      return result;
    });
}

export default function PlusVotingResultsPage() {
  const data = useLoaderData<PlusVotingResultsLoaderData>();

  const { month, year } = lastCompletedVoting(new Date());

  return (
    <div className="stack md">
      <h2 className="text-center">
        Voting results for {month + 1}/{year}
      </h2>
      {data.ownScores && data.ownScores.length > 0 ? (
        <>
          <ul className="plus-history__own-scores stack sm">
            {data.ownScores.map((result) => (
              <li key={result.tier}>
                You{" "}
                {result.passedVoting ? (
                  <span className="plus-history__success">passed</span>
                ) : (
                  <span className="plus-history__fail">didn&apos;t pass</span>
                )}{" "}
                the +{result.tier} voting
                {typeof result.score === "number"
                  ? `, your score was ${result.score}% ${
                      result.betterThan
                        ? `(better than ${result.betterThan}% others)`
                        : "(at least 50% required to pass)"
                    }`
                  : ""}
              </li>
            ))}
          </ul>
          <div className="text-sm text-center text-lighter">
            Click{" "}
            <a href={PLUS_SERVER_DISCORD_URL} target="_blank" rel="noreferrer">
              here
            </a>{" "}
            to join the Discord server. In some cases you might need to rejoin
            the server to get the correct role.
          </div>
        </>
      ) : null}
      {!data.ownScores ? (
        <div className="text-center text-sm">
          You weren&apos;t in the voting this month.
        </div>
      ) : null}
      {data.results ? <Results results={data.results} /> : null}
    </div>
  );
}

function Results({
  results,
}: {
  results: NonNullable<PlusVotingResultsLoaderData["results"]>;
}) {
  return (
    <div>
      <div className="text-xs text-lighter">S = Suggested user</div>
      <div className="stack lg">
        {results.map((tiersResults) => (
          <div className="stack md" key={tiersResults.tier}>
            <h3 className="plus-history__tier-header">
              <span>+{tiersResults.tier}</span>
            </h3>
            {(["passed", "failed"] as const).map((status) => (
              <div key={status} className="plus-history__passed-info-container">
                <h4 className="plus-history__passed-header">
                  {status === "passed" ? "Passed" : "Didn't pass"} (
                  {tiersResults[status].length})
                </h4>
                {tiersResults[status].map((user) => (
                  <Link
                    to={userPage(user)}
                    className={clsx("plus-history__user-status", {
                      failed: status === "failed",
                    })}
                    key={user.id}
                  >
                    {user.wasSuggested ? (
                      <span className="plus-history__suggestion-s">S</span>
                    ) : null}
                    {discordFullName(user)}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
