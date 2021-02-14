import { GetVotingSummariesByMonthAndTierData } from "./plusService";

export interface PlusVotingHistoryPageProps {
  summaries: GetVotingSummariesByMonthAndTierData;
}

const PlusVotingHistoryPage: React.FC<PlusVotingHistoryPageProps> = ({
  summaries,
}) => {
  console.log({ summaries });
  return <>hello</>;
};

export default PlusVotingHistoryPage;
