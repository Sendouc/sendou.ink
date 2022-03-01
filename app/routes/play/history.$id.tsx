import {
  json,
  Link,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  useLoaderData,
} from "remix";
import { makeTitle, Unpacked } from "~/utils";
import * as LFGMatch from "~/models/LFGMatch.server";
import invariant from "tiny-invariant";
import styles from "~/styles/play-match-history.css";
import clsx from "clsx";
import { sendouQMatchPage } from "~/utils/urls";
import { toTwoDecimals } from "~/core/mmr/utils";
import * as React from "react";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  return { title: makeTitle("SendouQ Match history") };
};

interface MathHistoryLoaderData {
  matches: {
    id: string;
    createdAtTimestamp: number;
    teammates: string[];
    opponents: string[];
    score: {
      our: number;
      their: number;
    };
  }[];
  stageCount: number;
  setWinRate: number;
  stageWinRate: number;
  ownName: string;
}

export const loader: LoaderFunction = async ({ params }) => {
  invariant(typeof params.id === "string", "Expected params.id to be string");

  const matches = await LFGMatch.findByUserId({ userId: params.id });
  if (matches.length === 0) throw new Response(null, { status: 404 }); // TODO: don't show link if it would 404?

  const ownUser = matches[0].groups
    .flatMap((g) => g.members)
    .find((m) => m.memberId === params.id);
  invariant(ownUser, "Unexpected no ownUser");

  const mappedMatches = matches.map(
    (match): Unpacked<MathHistoryLoaderData["matches"]> => {
      const usersGroup = match.groups.find((g) =>
        g.members.some((m) => m.memberId === params.id)
      );
      invariant(usersGroup, "Unexpected usersGroup undefined");

      const opposingGroup = match.groups.find((g) => g.id !== usersGroup.id);
      invariant(opposingGroup, "Unexpected opposingGroup undefined");

      return {
        id: match.id,
        createdAtTimestamp: match.createdAt.getTime(),
        teammates: usersGroup.members.map((m) => m.user.discordName),
        opponents: opposingGroup.members.map((m) => m.user.discordName),
        score: {
          our: match.stages
            .filter((s) => s.winnerGroupId)
            .reduce(
              (acc, stage) =>
                acc + Number(stage.winnerGroupId === usersGroup.id),
              0
            ),
          their: match.stages
            .filter((s) => s.winnerGroupId)
            .reduce(
              (acc, stage) =>
                acc + Number(stage.winnerGroupId !== usersGroup.id),
              0
            ),
        },
      };
    }
  );

  const stageCount = mappedMatches.reduce(
    (acc, match) => match.score.our + match.score.their + acc,
    0
  );

  return json<MathHistoryLoaderData>({
    ownName: ownUser.user.discordName,
    stageCount: mappedMatches.reduce(
      (acc, match) => match.score.our + match.score.their + acc,
      0
    ),
    setWinRate: toTwoDecimals(
      (mappedMatches.reduce(
        (acc, match) => Number(match.score.our > match.score.their) + acc,
        0
      ) /
        mappedMatches.length) *
        100
    ),
    stageWinRate: toTwoDecimals(
      (mappedMatches.reduce((acc, match) => match.score.our + acc, 0) /
        stageCount) *
        100
    ),
    matches: mappedMatches,
  });
};

export default function MatchHistoryPage() {
  const data = useLoaderData<MathHistoryLoaderData>();

  let lastDateShown = "";
  return (
    <>
      <h1 className="play-match-history__title">
        {data.ownName}&apos;s SendouQ results
      </h1>
      <span className="play-match-history__winrate-info">
        {data.matches.length} {data.matches.length === 1 ? "set" : "sets"}{" "}
        played ({data.setWinRate}% winrate)
      </span>{" "}
      •{" "}
      <span className="play-match-history__winrate-info">
        {data.stageCount} maps played ({data.stageWinRate}% winrate)
      </span>
      {data.matches.map((match) => {
        const currentDateString = new Date(
          match.createdAtTimestamp
        ).toLocaleString("en-US", {
          dateStyle: "long",
        });
        let showDate = false;
        if (lastDateShown !== currentDateString) {
          showDate = true;
          lastDateShown = currentDateString;
        }

        return (
          <React.Fragment key={match.id}>
            {showDate && (
              <h2 className="play-match-history__date">{currentDateString}</h2>
            )}
            <div className="play-match-history__match">
              <time
                className="play-match-history__time-header"
                dateTime={new Date(match.createdAtTimestamp).toISOString()}
              >
                {new Date(match.createdAtTimestamp).toLocaleString("en-us", {
                  hour: "2-digit",
                  minute: "numeric",
                })}
              </time>
              <div>
                <div>
                  <span
                    className={clsx("play-match-history__score-header", {
                      winner: match.score.their < match.score.our,
                    })}
                  >
                    {match.score.our}
                  </span>
                  <span className="play-match-history__players">
                    {match.teammates.join(", ")}
                  </span>
                </div>
                <div>
                  <span
                    className={clsx("play-match-history__score-header", {
                      winner: match.score.their > match.score.our,
                    })}
                  >
                    {match.score.their}
                  </span>
                  <span className="play-match-history__players">
                    {match.opponents.join(", ")}
                  </span>
                </div>
                <div className="play-match-history__match-page-link-mobile">
                  <Link to={sendouQMatchPage(match.id)}>View details</Link>
                </div>
              </div>
              <div className="play-match-history__match-page-link">
                <Link to={sendouQMatchPage(match.id)}>View details</Link>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}
