import { Box } from "@chakra-ui/layout";
import { Flex } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { PlusRegion } from "@prisma/client";
import MyHead from "components/common/MyHead";
import NewTable from "components/common/NewTable";
import UserAvatar from "components/common/UserAvatar";
import { useMyTheme } from "hooks/common";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { Fragment } from "react";
import plusService, {
  DistinctSummaryMonths,
  VotingSummariesByMonthAndTier,
} from "services/plus";
import { getFullUsername, getLocalizedMonthYearString } from "utils/strings";

export interface PlusVotingHistoryPageProps {
  summaries: VotingSummariesByMonthAndTier;
  monthsWithData: DistinctSummaryMonths;
}

const PlusVotingHistoryPage = ({
  summaries,
  monthsWithData,
}: PlusVotingHistoryPageProps) => {
  const { gray } = useMyTheme();
  const router = useRouter();

  return (
    <>
      <MyHead title="Voting History" />
      <Select
        size="sm"
        borderRadius="lg"
        onChange={(e) => {
          router.replace(`/plus/history/${e.target.value}`);
        }}
        maxW={64}
        mb={4}
        data-cy="tier-selector"
      >
        {monthsWithData.map(({ month, year, tier }) => (
          <option
            key={`${month}${year}${tier}`}
            value={`${tier}/${year}/${month}`}
          >
            +{tier} - {getLocalizedMonthYearString(month, year, "en")}
          </option>
        ))}
      </Select>
      <NewTable
        smallAtPx="700"
        headers={[
          { name: "name", dataKey: "name" },
          { name: "percentage", dataKey: "percentage" },
          { name: "count (na)", dataKey: "countNa" },
          { name: "count (eu)", dataKey: "countEu" },
          { name: "region", dataKey: "region" },
        ]}
        data={summaries.map((summary) => {
          const getCount = (region: PlusRegion, counts: number[]) => {
            if (region === summary.regionForVoting) return counts;

            return counts.slice(1, 3);
          };

          return {
            id: summary.user.id,
            name: (
              <Flex align="center">
                <UserAvatar user={summary.user} size="xs" mr={2} />
                {getFullUsername(summary.user)}{" "}
                {summary.wasSuggested && (
                  <Box as="span" fontWeight="bold" color="theme.500">
                    (S)
                  </Box>
                )}
                {summary.wasVouched && (
                  <Box as="span" fontWeight="bold" color="theme.500">
                    (V)
                  </Box>
                )}
              </Flex>
            ),
            percentage: (
              <Box color={summary.percentage >= 50 ? "green.500" : "red.500"}>
                {summary.percentage}%
              </Box>
            ),
            countNa: getCount("NA", summary.countsNA).map((count, i, arr) => (
              <Fragment key={i}>
                <Box
                  as="span"
                  color={i + 1 <= arr.length / 2 ? "red.500" : "green.500"}
                >
                  {count}
                </Box>
                {i !== arr.length - 1 && <>/</>}
              </Fragment>
            )),
            countEu: getCount("EU", summary.countsEU).map((count, i, arr) => (
              <Fragment key={i}>
                <Box
                  as="span"
                  color={i + 1 <= arr.length / 2 ? "red.500" : "green.500"}
                >
                  {count}
                </Box>
                {i !== arr.length - 1 && <>/</>}
              </Fragment>
            )),
            region: summary.regionForVoting,
          };
        })}
      />

      <Box mt={6} fontSize="sm" color={gray}>
        <Box as="span" fontWeight="bold" color="theme.500">
          (S)
        </Box>{" "}
        = was a suggestion
        <Box as="span" fontWeight="bold" color="theme.500" ml={4}>
          (V)
        </Box>{" "}
        = was a vouch
      </Box>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PlusVotingHistoryPageProps> =
  async ({ params }) => {
    const getSlug = async () => {
      const slug = Array.isArray(params!.slug) ? params!.slug : [];
      if (slug.length === 3) {
        return slug;
      }

      if (slug.length > 0) {
        return [];
      }

      const mostRecent =
        await plusService.getMostRecentVotingWithResultsMonth();

      return ["1", mostRecent.year, mostRecent.month];
    };

    const [tier, year, month] = (await getSlug()).map((param) => Number(param));
    if (!tier) return { notFound: true };

    const [summaries, monthsWithData] = await Promise.all([
      plusService.getVotingSummariesByMonthAndTier({
        tier: tier as any,
        year,
        month,
      }),
      plusService.getDistinctSummaryMonths(),
    ]);

    if (!summaries.length) return { notFound: true };

    return {
      props: { summaries, monthsWithData },
    };
  };

export default PlusVotingHistoryPage;
