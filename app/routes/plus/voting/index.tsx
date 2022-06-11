import { monthsVotingRange, upcomingVoting } from "~/modules/plus-server";

export default function PlusVotingPage() {
  return (
    <div className="text-sm text-center">
      Next voting starts{" "}
      {monthsVotingRange(upcomingVoting(new Date())).startDate.toLocaleString(
        "en-US"
      )}
    </div>
  );
}
