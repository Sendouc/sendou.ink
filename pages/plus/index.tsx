import { Box, Center, Divider, Flex, Heading, Stack } from "@chakra-ui/layout";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Progress,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyHead from "components/common/MyHead";
import SubText from "components/common/SubText";
import Suggestion from "components/plus/Suggestion";
import SuggestionModal from "components/plus/SuggestionModal";
import VotingInfoHeader from "components/plus/VotingInfoHeader";
import VouchesList from "components/plus/VouchesList";
import VouchModal from "components/plus/VouchModal";
import { useUser } from "hooks/common";
import { usePlusHomePage } from "hooks/plus";
import { ssr } from "pages/api/trpc/[trpc]";
import { Fragment } from "react";
import { getVotingRange } from "utils/plus";
import { getFullUsername } from "utils/strings";

const PlusHomePage = () => {
  const [user] = useUser();
  const {
    plusStatusData,
    vouchStatuses,
    suggestionsData,
    ownSuggestion,
    suggestionCounts,
    setSuggestionsFilter,
    vouchedPlusStatusData,
    votingProgress,
  } = usePlusHomePage();

  if (!plusStatusData?.membershipTier) {
    return (
      <Box>
        <Box fontSize="sm" mb={4}>
          <VotingInfoHeader isMember={!!plusStatusData?.membershipTier} />
        </Box>
        <Heading size="md">Suggested players this month:</Heading>
        <Flex flexWrap="wrap" data-cy="alt-suggestions-container">
          {suggestionsData
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((suggestion) => (
              <Box
                key={suggestion.tier + "+" + suggestion.suggestedUser.id}
                m={1}
              >
                {getFullUsername(suggestion.suggestedUser)} (+{suggestion.tier})
              </Box>
            ))}
        </Flex>
      </Box>
    );
  }

  return (
    <>
      <MyHead title="Plus Server" />
      <Box fontSize="sm" mb={4}>
        <VotingInfoHeader isMember={!!plusStatusData?.membershipTier} />
      </Box>
      {votingProgress && (
        <Box textAlign="center">
          <SubText>
            +1 ({votingProgress[1].voted}/{votingProgress[1].totalVoterCount})
          </SubText>
          <Progress
            value={
              (votingProgress[1].voted / votingProgress[1].totalVoterCount) *
              100
            }
            size="xs"
            colorScheme="pink"
            mb={6}
          />
          <SubText>
            +2 ({votingProgress[2].voted}/{votingProgress[2].totalVoterCount})
          </SubText>
          <Progress
            value={
              (votingProgress[2].voted / votingProgress[2].totalVoterCount) *
              100
            }
            size="xs"
            colorScheme="blue"
            mb={6}
          />
          <SubText>
            +3 ({votingProgress[3].voted}/{votingProgress[3].totalVoterCount})
          </SubText>
          <Progress
            value={
              (votingProgress[3].voted / votingProgress[3].totalVoterCount) *
              100
            }
            size="xs"
            colorScheme="yellow"
            mb={6}
          />
        </Box>
      )}
      {!getVotingRange().isHappening && (
        <>
          {plusStatusData &&
            plusStatusData.membershipTier &&
            !ownSuggestion && (
              <SuggestionModal
                userPlusMembershipTier={plusStatusData.membershipTier}
              />
            )}
          {plusStatusData &&
            plusStatusData.canVouchFor &&
            !plusStatusData.canVouchAgainAfter && (
              <VouchModal canVouchFor={plusStatusData.canVouchFor} />
            )}
        </>
      )}
      {plusStatusData &&
        (plusStatusData.canVouchAgainAfter ||
          plusStatusData.voucher ||
          vouchedPlusStatusData) && (
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            mt={2}
            mb={6}
            rounded="lg"
          >
            <AlertDescription maxWidth="sm">
              <AlertTitle mb={1} fontSize="lg">
                Vouching status
              </AlertTitle>
              {plusStatusData?.canVouchAgainAfter && (
                <Box>
                  Can vouch again after:{" "}
                  {plusStatusData.canVouchAgainAfter.toLocaleDateString()}{" "}
                  (resets after voting)
                </Box>
              )}
              {plusStatusData?.voucher && (
                <Box>
                  Vouched for <b>+{plusStatusData.vouchTier}</b> by{" "}
                  {getFullUsername(plusStatusData.voucher)}
                </Box>
              )}
              {vouchedPlusStatusData && (
                <Box>
                  Vouched {getFullUsername(vouchedPlusStatusData.user)} to{" "}
                  <b>+{vouchedPlusStatusData.vouchTier}</b>
                </Box>
              )}
            </AlertDescription>
          </Alert>
        )}
      <Center mt={2}>
        <RadioGroup
          defaultValue="ALL"
          onChange={(value) => {
            const tier = [null, "ONE", "TWO", "THREE"].indexOf(value as any);
            setSuggestionsFilter(tier === -1 ? undefined : tier);
          }}
        >
          <Stack spacing={4} direction={["column", "row"]}>
            <Radio value="ALL">
              <Trans>
                All (
                {suggestionCounts.ONE +
                  suggestionCounts.TWO +
                  suggestionCounts.THREE}
                )
              </Trans>
            </Radio>
            <Radio value="ONE">
              <Flex align="center">
                <SubText mr={2}>+1</SubText> ({suggestionCounts.ONE})
              </Flex>
            </Radio>
            <Radio value="TWO">
              <Flex align="center">
                <SubText mr={2}>+2</SubText> ({suggestionCounts.TWO})
              </Flex>
            </Radio>
            <Radio value="THREE" data-cy="plus-three-radio">
              <Flex align="center">
                <SubText mr={2}>+3</SubText> ({suggestionCounts.THREE})
              </Flex>
            </Radio>
          </Stack>
        </RadioGroup>
      </Center>
      {!getVotingRange().isHappening &&
        vouchStatuses &&
        vouchStatuses.length > 0 && (
          <Box mt={4}>
            <VouchesList vouches={vouchStatuses} />
          </Box>
        )}
      {suggestionCounts.ONE + suggestionCounts.TWO + suggestionCounts.THREE ===
      0 ? (
        <Box mt={4}>No suggestions yet for this month</Box>
      ) : (
        <>
          {suggestionsData.map((suggestion, i) => {
            const canSuggest = () => {
              if (!plusStatusData?.membershipTier) return false;
              if (plusStatusData.membershipTier > suggestion.tier) return false;
              if (suggestion.suggesterUser.id === user?.id) return false;
              if (
                suggestion.resuggestions?.some(
                  (suggestion) => suggestion.suggesterUser.id === user?.id
                )
              )
                return false;

              return true;
            };
            return (
              <Fragment
                key={suggestion.suggestedUser.id + "-" + suggestion.tier}
              >
                <Suggestion suggestion={suggestion} canSuggest={canSuggest()} />
                {i < suggestionsData.length - 1 && <Divider />}
              </Fragment>
            );
          })}
        </>
      )}
    </>
  );
};

export const getStaticProps = async () => {
  await Promise.all([
    ssr.prefetchQuery("plus.suggestions"),
    ssr.prefetchQuery("plus.statuses"),
  ]);

  return {
    props: {
      dehydratedState: ssr.dehydrate(),
    },
    revalidate: 60,
  };
};

export default PlusHomePage;
