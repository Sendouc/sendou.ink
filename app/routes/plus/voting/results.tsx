import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { lastCompletedVoting } from "~/core/plus";
import { db } from "~/db";
import type { PlusVotingResultByMonthYear } from "~/db/models/plusVotes.server";
import type { PlusVotingResult } from "~/db/types";
import { roundToTwoDecimalPlaces } from "~/utils/number";
import { getUser, makeTitle } from "~/utils/remix";
import type { Unpacked } from "~/utils/types";
import styles from "~/styles/plus-history.css";
import { discordFullName } from "~/utils/strings";
import { Link } from "react-router-dom";
import { userPage } from "~/utils/urls";
import clsx from "clsx";

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
  results: PlusVotingResultByMonthYear["results"];
  ownScores?: {
    score?: PlusVotingResult["score"];
    tier: PlusVotingResult["tier"];
    passedVoting: PlusVotingResult["passedVoting"];
  }[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const { results, ownScores } = db.plusVotes.resultsByMontYear({
    ...lastCompletedVoting(new Date()),
    userId: user?.id,
  });

  return json<PlusVotingResultsLoaderData>({
    results,
    ownScores: ownScores?.map(maybeHideScore),
  });
};

export default function PlusVotingResultsPage() {
  const data = useLoaderData<PlusVotingResultsLoaderData>();

  const { month, year } = lastCompletedVoting(new Date());

  return (
    <div className="stack md">
      <h2 className="text-center">
        Voting results for {month + 1}/{year}
      </h2>
      {data.ownScores && data.ownScores.length > 0 ? (
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
              {result.score
                ? `, your score was ${result.score} (at least 0.5 required to pass)`
                : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <Results />
    </div>
  );
}

function Results() {
  const data = useLoaderData<PlusVotingResultsLoaderData>();

  return (
    <div className="stack lg">
      {data.results.map((tiersResults) => (
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
                  to={userPage(user.discordId)}
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
  );
}

function maybeHideScore(
  score: Unpacked<NonNullable<PlusVotingResultByMonthYear["ownScores"]>>
) {
  const showScore = score.wasSuggested && !score.passedVoting;

  return {
    tier: score.tier,
    score: showScore ? roundToTwoDecimalPlaces(score.score) : undefined,
    passedVoting: score.passedVoting,
  };
}
