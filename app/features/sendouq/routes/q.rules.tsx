import type { MetaFunction } from "@remix-run/react";
import { Main } from "~/components/Main";
import { makeTitle } from "~/utils/strings";

export const meta: MetaFunction = () => {
  return [{ title: makeTitle("SendouQ Rules") }];
};

export default function SendouqRules() {
  return (
    <Main>
      <h1>SendouQ Rules</h1>
      <h2 className="text-lg">Disconnections</h2>
      <div>
        Each team is allowed one replay per set due to a team member
        disconnecting. Replay is only possible if ALL of the following are true:
        <ol>
          <li>
            More than half was left in the clock (the clock was 2:30 or higher
            at the time of the DC)
          </li>
          <li>
            The team without DC&apos;s objective counter had not reached 30 at
            the time of the disconnect
          </li>
          <li>Team with the disconnection stopped playing without delay</li>
          <li>Disconnection was unintentional</li>
        </ol>
        For the replay same weapons and gear must be used by both teams. The
        team who fails to do so loses the map. If players disconnect from both
        teams a replay can be played without using either team&apos;s one replay
        for the set (or even if there were no replays left to use from either
        team). Host disconnection can be replayed with the same conditions as
        above.
        <br />
        <br /> After the DC replay has been used by the team, further DC&apos;s
        should be played out.
      </div>

      <h2 className="text-lg mt-4">Subs</h2>
      <div>
        There are no subs. If a player is unavailable to play from either team
        then the set must be played with 3 players or forfeited.
      </div>

      <h2 className="text-lg mt-4">Canceling match</h2>
      <div>
        Match can be canceled if both group owners agree. If the groups
        don&apos;t agree then the match should be played out.
      </div>

      <h2 className="text-lg mt-4">Alting</h2>
      <div>You can only play with one account.</div>

      <h2 className="text-lg mt-4">Player eligibility</h2>
      <div>
        Players banned by{" "}
        <a href="https://twitter.com/splatsafety">
          Splatoon Competitive Community Safety
        </a>{" "}
        are not allowed to participate. Playing with banned players is not
        allowed.
      </div>

      <h2 className="text-lg mt-4">Time limits</h2>
      <div>
        After a team has all their members in the lobby and has shared the
        password with the other team then that team has <b>15 minutes</b> to
        join the lobby. Failing to do so, the match can be started with the
        members currently in the room. If a player has problems connecting to
        the room it is advised to try switching the host.
      </div>

      <h2 className="text-lg mt-4">Spectators</h2>
      <div>There can be spectators if both teams agree to it.</div>

      <h2 className="text-lg mt-4">Intentional losing</h2>
      <div>
        Players are not allowed to intentionally lose a match. This includes
        (but is not limited to) tanking your own rank on purpose or boosting
        another player&apos;s/team&apos;s ranking.
      </div>

      <h2 className="text-lg mt-4">Unsportsmanlike conduct</h2>
      <div>
        It&apos;s not allowed to spawncamp the enemy without pushing the
        objective provided it can&apos;t be considered a viable strategy taking
        in account the game situation.
      </div>

      <h2 className="text-lg mt-4">Discriminatory language</h2>
      <div>
        Any kind of discriminatory language such as using slurs is strictly not
        allowed. This rule applies everywhere in SendouQ including (but not
        limited to) text chats, voice chats & in-game names.
      </div>

      <h2 className="text-lg mt-4">Repercussions</h2>
      <div>
        Players found breaking the rules can lose access to SendouQ and other
        sendou.ink features such as tournaments and the Plus Server.
      </div>
    </Main>
  );
}
