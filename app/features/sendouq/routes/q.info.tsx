import { Link } from "@remix-run/react";
import { Main } from "~/components/Main";
import {
  CALENDAR_PAGE,
  FAQ_PAGE,
  SENDOUQ_RULES_PAGE,
  SENDOUQ_SETTINGS_PAGE,
  TIERS_PAGE,
  navIconUrl,
} from "~/utils/urls";

import "../q.css";
import { Image } from "~/components/Image";
import { MATCHES_COUNT_NEEDED_FOR_LEADERBOARD } from "~/features/leaderboards/leaderboards-constants";
import { USER_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN } from "~/features/mmr/mmr-constants";

export default function SendouQInfoPage() {
  return (
    <Main className="q-info__container">
      <GeneralInfo />
      <BeforeJoining />
      <JoiningTheQueue />
      <FindingAGroup />
      <FindingAnOpponent />
      <PlayingTheMatch />
      <OtherTopics />
    </Main>
  );
}

function GeneralInfo() {
  return (
    <section>
      <h2>General info</h2>
      <p>
        SendouQ is a community made matchmaking system. It features leaderboards
        and a season system. Everyone is free to join no matter if they are new
        to competitive Splatoon or a top level player. The system aims to
        connect people with similar skill levels with each other. It&apos;s
        different from what the game offers (Anarchy Battle, X Rank etc.) in
        that the sets are best out of 7 and you choose your teammates.
      </p>
    </section>
  );
}

function BeforeJoining() {
  return (
    <section>
      <h2>Before joining</h2>
      <h3>Make a sendou.ink account</h3>
      <p>
        Click “log in” on the front page (mobile) or top right (desktop). Agree
        to connecting your Discord account, you will be redirected and the
        account is made.
      </p>
      <h3>Select your map pool</h3>
      <p>
        Optional - if you don&apos;t have a preference then skip this step and
        other players in the lobby get to choose. On the{" "}
        <Link to={SENDOUQ_SETTINGS_PAGE}>settings page</Link> first select your
        preference of each of the five modes. Avoid means you&apos;d rather not
        play the mode. Neutral means you don&apos;t have strong feelings either
        way. Prefer means you like this mode over neutral modes. These choices
        later affect what modes you will be playing. In SendouQ you might play a
        set with SZ/TC/RM/CB or only TC or TC/RM or any other combination. It
        all depends on what people have chosen.
      </p>
      <p>
        For each mode that you didn&apos;t avoid also choose 7 maps. Again the
        choices you make are in part deciding what map lists you will be playing
        on. You can&apos;t choose maps that are excluded from the map pool for
        the season (banned). Banned maps are typically those with least
        likelihood to appear in tournaments or generally have been very rarely
        picked based on the data of previous seasons.
      </p>
      <p>
        Finally hit save to save your preference (also do this for each step
        below).
      </p>
      <h3>Weapon pool</h3>
      <p>
        Choose up to 4 weapons that you will be playing. Don&apos;t skip this
        step as it&apos;s important for team building reasons.
      </p>
      <h3>Voice chat</h3>
      <p>
        Select whether you can voice chat, listen only or neither. Also select
        the languages you speak. Again this is an important step so don&apos;t
        skip this one. Note if you select that you can voice chat it&apos;s
        expected that you will join the voice chat when asked.
      </p>
      <h3>Avoiding Splattercolor Screen</h3>
      <p>
        You can select to avoid Splattercolor Screen. This option exists for
        accessibility reasons. Toggling this option means screen will be banned
        in all sets you play. But also note that groups challenging your group
        will see that screen would be banned in your set so it&apos;s not
        adviced to select this option unnecessarily.
      </p>
      <h3>Bio</h3>
      <p>
        On your user profile page put a short description to your bio about your
        previous competitive experience etc. information you think would be
        useful for team building purposes.
      </p>
      <h3>Friend code</h3>
      <p>
        On the SendouQ front page enter your friend code. It&apos;s your
        responsibility to make sure it matches the account you will be playing
        on. Anything else will be considered alting by default which is against
        the rules. If you need to change friend code after setting it use the
        helpdesk on our Discord server or contact Sendou directly via DM.
      </p>
      <h3>Reading rules</h3>
      <p>
        Read the <Link to={SENDOUQ_RULES_PAGE}>rules</Link>. You agree to follow
        them when you play SendouQ.
      </p>
    </section>
  );
}

function JoiningTheQueue() {
  return (
    <section>
      <h2>Joining the queue</h2>
      <h3>Joining solo</h3> <p>Click “Join solo” on the SendouQ front page.</p>
      <h3>Joining with 1-3 mates</h3>
      <p>
        Click “Join with mates” on the SendouQ front page. On the following page
        share the invite link with your mates. You can also “Quick add” mates if
        they are in the same sendou.ink team or they played with you before and
        selected the option to let you do this.
      </p>
      <p>Click “Join the queue” after your mates have joined.</p>
    </section>
  );
}

function FindingAGroup() {
  return (
    <section>
      <h2>Finding a group</h2>
      <p>
        <p>
          If you didn&apos;t join with a full group of 4 next you will join a
          screen where the aim is to get a full group. You do this by getting
          other people join your group or morphing with other groups. Click the
          “Invite” button for any group you would like to group up with
          considering the weapons, skill level and other factors. There is no
          downside in sending more invites so it&apos;s not advised to only send
          one invite at a time and waiting for them to accept but keep sending
          new invites till you find a match.
        </p>
        <p>
          Naturally other groups can also invite you in which case it&apos;s up
          to you to decide whether to accept or not. There is no explicit
          decline invite feature so if you don&apos;t want to group up then just
          don&apos;t click the “Group up” button.
        </p>
        <p>Repeat this grouping up process till you have a full group of 4.</p>
      </p>
      <h3>Plus Server icons</h3>
      <p>
        <Image alt="" path={navIconUrl("plus")} size={24} />
        <p>
          Icon above means that the player is a member of the Plus Server. See{" "}
          <Link to={FAQ_PAGE}>FAQ</Link> for more info.
        </p>
      </p>
      <h3>Adding a note</h3>
      <p>
        You can add a public note if you want to communicate something to other
        groups that might influence grouping up somehow. E.g. message that you
        will be streaming the set with VC so people who don&apos;t want to
        appear on stream can avoid your group.
      </p>
      <h3>Inactivity</h3>
      <p>
        If you don&apos;t do any actions for 30 minutes your group will be
        marked inactive and hidden. Click the prompt that you are still looking
        to be visible again.
      </p>
    </section>
  );
}

function FindingAnOpponent() {
  return (
    <section>
      <p>TODO</p>
      <h2>Finding an opponent</h2>
      <h3>Rechallenging</h3>
      <p>TODO</p>
    </section>
  );
}

function PlayingTheMatch() {
  return (
    <section>
      <p>TODO, info about hosting & how to join a room in S3</p>
      <h2>Playing the match</h2>
      <h3>Canceling the match</h3>
      <p>TODO</p>
      <h3>Private note</h3>
      <p>TODO</p>
      <h3>Joining again with the same group</h3>
      <p>TODO</p>
      <h3>Stats</h3>
      <p>TODO</p>
    </section>
  );
}

function OtherTopics() {
  return (
    <section>
      <h2>Other topics</h2>
      <h3>Ranking algorithm</h3>
      <p>
        The ranking algorithm used is called OpenSkill. Most common question
        people have is how is it possible that their higher ranked mate loses
        less points than they do. This is possible because of “confidence
        rating” which is an internal value that goes down when you perform as
        the algorithm expects you to perform and goes up when it&apos;s the
        opposite. Check Joy&apos;s{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://twitter.com/JoyTheDataNerd/status/1709651029971570960"
        >
          Twitter thread
        </a>{" "}
        on a longer explanation.
      </p>
      <h3>Ranking tiers</h3>
      <p>
        <Link to={TIERS_PAGE}>
          View full list of tiers and current SP criteria
        </Link>
      </p>
      <p>
        You will see your ranking tier for the season after completing{" "}
        {MATCHES_COUNT_NEEDED_FOR_LEADERBOARD} sets (calculation).
      </p>
      <p>
        Unlike most other games in SendouQ ranking tiers are strictly based on
        percentage. This means that e.g. Leviathan is always the top 5% of the
        players. This also means that your ranking tier might go up or down
        without playing when other players&apos; rankings change.
      </p>
      <p>
        There is also a tier recalculation in the first week of the season that
        can change your ranking tier significantly. When there are less than{" "}
        {USER_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN} entries on the leaderboard
        tiers are calculated based everyone&apos;s powers. After crossing that
        threshold tiers switch being calculated based on players on the
        leaderboard only.
      </p>
      <h3>Rank history</h3>
      <p>
        You can see your ranking history graph on your user profile&apos;s
        “Seasons” page. Note that to to view your rank history, two conditions
        must be met: 1. You have completed a minimum of 7 sets. 2. These sets
        were played across 3 separate days, according to server time.
      </p>
      <h3>Team ranking</h3>
      <p>
        Team ranking is just ranking of unique rosters of 4. This means that If
        your team has 5 members (A, B, C, D, E) then you would potentially have
        different rankings with A-B-C-D, B-C-D-E, A-C-D-E etc. You don&apos;t
        need to do anything special such as creating a team on sendou.ink to
        start playing for a team ranking. The system automatically tracks team
        ranking for each unique roster that plays.
      </p>
      <p>
        Note that the default team leaderboard only shows the highest team
        ranking per player so you might not show up at all if the mates of your
        rankings have higher rankings with other players.
      </p>
      <h3>Ranked tournaments</h3>
      <p>
        In addition to SendouQ, tournaments can also affect your ranking. Check
        the <Link to={CALENDAR_PAGE}>calendar</Link> to find tournaments hosted
        on sendou.ink. If on the registration page it has the “Ranked” badge
        then you know it is a ranked tournament. In ranked tournaments each set
        is counted as a SendouQ set. Ranking changes are applied when the
        tournament ends and is finalised by the TO.
      </p>
      <p>
        If you sub around then note that only the people who played in the set
        have their ranking changed. If you sub in the middle of a set then
        it&apos;s counted based on people who played the majority of the set.
      </p>
      <h3>SendouQ Season Finale</h3>
      <p>
        Top 12 teams are invited to a SendouQ Season Finale event that typically
        happens 1 week after season ending. It has a price pot of $750 and is
        Splat Zones only.
      </p>
      <h3>Off-season</h3>
      <p>
        For off-season (usually around 2 weeks between seasons) SendouQ is not
        available.
      </p>
    </section>
  );
}
