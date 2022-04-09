import MyLink from "components/common/MyLink";
import { getVotingRange } from "utils/plus";

const VotingInfoHeader = ({ isMember }: { isMember: boolean }) => {
  const { isHappening, endDate, nextVotingDate } = getVotingRange();

  if (isHappening && isMember) {
    return (
      <>
        Voting is open till {endDate.toLocaleString()}.{" "}
        <MyLink href="/plus/voting">Go vote</MyLink>
      </>
    );
  }

  if (isHappening)
    return (
      <>
        Voting is happening till {endDate.toLocaleString()}.
      </>
    );

  return (
    <>
      Next voting starts {nextVotingDate.toLocaleString()}.
    </>
  );
};

export default VotingInfoHeader;
