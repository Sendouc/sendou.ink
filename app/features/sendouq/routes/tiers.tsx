import { TierImage } from "~/components/Image";
import { Main } from "~/components/Main";
import {
  TEAM_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN,
  TIERS,
  USER_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN,
} from "~/features/mmr/mmr-constants";

export default function TiersPage() {
  return (
    <Main halfWidth className="stack md">
      {TIERS.map((tier) => {
        return (
          <div key={tier.name} className="stack horizontal sm items-center">
            <TierImage tier={{ isPlus: false, name: tier.name }} width={150} />
            <div>
              <div className="text-lg font-bold">{tier.name}</div>
              <div className="text-lg font-bold text-lighter">
                {tier.percentile}%
              </div>
            </div>
          </div>
        );
      })}
      <p>
        For example Leviathan is the top 5% of players. Diamond is the 85th
        percentile etc.
      </p>
      <p>
        Note: Nobody has Leviathan rank before there are at least{" "}
        {USER_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN} players on the leaderboard
        (or {TEAM_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN} for teams)
      </p>
      <p>
        Each rank also has a plus tier (see BRONZE+ as an example below). This
        means that you are in the top 50% of that rank.
        <TierImage tier={{ isPlus: true, name: "BRONZE" }} width={32} />
      </p>
    </Main>
  );
}
