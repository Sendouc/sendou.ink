import { Box } from "@chakra-ui/layout";
import { Trans } from "@lingui/macro";
import { PlusRegion } from "@prisma/client";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "components/common/Table";
import UserAvatar from "components/common/UserAvatar";
import { FiCheck } from "react-icons/fi";
import { formatUsername } from "utils/strings";
import { GetVotingSummariesByMonthAndTierData } from "../../services/plusService";

export interface PlusVotingHistoryPageProps {
  summaries: GetVotingSummariesByMonthAndTierData;
}

const PlusVotingHistoryPage: React.FC<PlusVotingHistoryPageProps> = ({
  summaries,
}) => {
  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader />
            <TableHeader>
              <Trans>Name</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Percentage</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Count (NA)</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Count (EU)</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Region</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Suggested</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Vouched</Trans>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {summaries.map((summary) => {
            const getCount = (region: PlusRegion, counts: number[]) => {
              if (region === summary.regionForVoting) return counts;

              return counts.slice(1, 3);
            };
            return (
              <TableRow key={summary.user.id}>
                <TableCell>
                  <UserAvatar user={summary.user} />
                </TableCell>
                <TableCell>{formatUsername(summary.user)}</TableCell>
                <TableCell
                  color={summary.percentage >= 50 ? "green.500" : "red.500"}
                >
                  {summary.percentage}%
                </TableCell>
                <TableCell>
                  {getCount("NA", summary.countsNA).join("/")}
                </TableCell>
                <TableCell>
                  {getCount("EU", summary.countsEU).join("/")}
                </TableCell>
                <TableCell>{summary.regionForVoting}</TableCell>
                <TableCell>
                  {summary.wasSuggested && (
                    <Box mx="auto" fontSize="xl" as={FiCheck} />
                  )}
                </TableCell>
                <TableCell>
                  {summary.wasVouched && (
                    <Box mx="auto" fontSize="xl" as={FiCheck} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default PlusVotingHistoryPage;
