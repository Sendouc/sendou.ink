import MyLink from "components/common/MyLink";
import { getVotingRange } from "lib/plus";

const VotingInfoHeader = ({ isMember }: { isMember: boolean }) => {
  const { isHappening, endDate, nextVotingDate } = getVotingRange();

  if (isHappening && isMember) {
    return (
      <>
        Voting is open till {endDate.toLocaleString()}.{" "}
        <MyLink href="/plus/voting">Go vote</MyLink> or{" "}
        <MyLink href="/plus/history">view voting history</MyLink>
      </>
    );
  }

  if (isHappening)
    return (
      <>
        Voting is happening till {endDate.toLocaleString()}.{" "}
        <MyLink href="/plus/history">View voting history</MyLink>
      </>
    );

  return (
    <>
      Next voting starts {nextVotingDate.toLocaleString()}.{" "}
      <MyLink href="/plus/history">View voting history</MyLink>
    </>
  );
};

export default VotingInfoHeader;
