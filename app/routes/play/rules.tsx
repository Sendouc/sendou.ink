import React from "react";
import { MetaFunction } from "remix";
import { makeTitle } from "~/utils";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Rules of SendouQ"),
  };
};

export default function PlayRulesPage() {
  return (
    <article>
      <h1 className="text-center">Rules of SendouQ</h1>
      <div className="text-center text-sm">v.1.0</div>

      <h2>Disconnections</h2>
      <Paragraph>
        Each team is allowed one replay per set due to a team member
        disconnecting. Replay is only possible if ALL of the following are true:
        <ol className="mt-2">
          <li>
            More than half was left in the clock (clock was 2:30 or higher at
            the time of the DC)
          </li>
          <li>
            The team without DC's objective counter was at 30 or higher at the
            time of the disconnect
          </li>
          <li>Team with the disconnection stopped playing without delay</li>
          <li>
            Disconnection was unintentional (smacking your table and the Switch
            popping out of the dock is not considered unintentional btw)
          </li>
        </ol>
      </Paragraph>
      <Paragraph>
        For the replay same weapons and gear must be used by both teams. Team
        who fails to do so loses the map.
      </Paragraph>
      <Paragraph>
        If players disconnect from both teams a replay can be played without
        using either team's one replay for the set (or even if there were no
        replays left to use from either team).
      </Paragraph>
      <Paragraph>
        Host disconnection can be replayed with the same conditions as above.
      </Paragraph>

      <h2>Time limits</h2>
      <Paragraph>
        Once a team has all 4 players in the room ready to play then the other
        team has at most 10 minutes to join the room. Failure to do so means
        that the set should be started with whatever players are currently in
        the room.
      </Paragraph>

      <h2>Subbing</h2>
      <Paragraph>
        Subs are not allowed. If one or several players in a team can't play or
        can't be reached then the set has to be played without them (3v4 etc.)
        or forfeited.
      </Paragraph>

      <h2>Alting</h2>
      <Paragraph>
        You are only allowed to play SendouQ on one account. You are not allowed
        to impersonate another player.
      </Paragraph>

      <h2>General conduct</h2>
      <Paragraph>Treat everyone with respect.</Paragraph>
    </article>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="my-4">{children}</p>;
}
