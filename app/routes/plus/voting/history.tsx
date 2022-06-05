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

interface PlusVotingHistoryLoaderData {
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

  return json<PlusVotingHistoryLoaderData>({
    results,
    ownScores: ownScores?.map(maybeHideScore),
  });
};

export default function PlusVotingHistoryPage() {
  const data = useLoaderData<PlusVotingHistoryLoaderData>();

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
              the +1 voting
              {result.score
                ? `, your score was ${result.score} (at least 0.5 required to pass)`
                : ""}
            </li>
          ))}
        </ul>
      ) : null}
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
