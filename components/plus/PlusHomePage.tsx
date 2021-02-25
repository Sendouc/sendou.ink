import { Button } from "@chakra-ui/button";
import { Box, Center, Divider, Flex, Stack } from "@chakra-ui/layout";
import { Radio, RadioGroup } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import UserAvatar from "components/common/UserAvatar";
import { useUser } from "hooks/common";
import { usePlus } from "hooks/plus";
import useMutation from "hooks/useMutation";
import { getFullUsername } from "lib/strings";
import { Fragment } from "react";
import Suggestion from "./Suggestion";
import SuggestionVouchModal from "./SuggestionVouchModal";

export interface PlusHomePageProps {}

const PlusHomePage: React.FC<PlusHomePageProps> = () => {
  const [user] = useUser();
  const {
    plusStatusData,
    suggestionsData,
    ownSuggestion,
    suggestionsLoading,
    suggestionCounts,
    setSuggestionsFilter,
  } = usePlus();

  return (
    <>
      {plusStatusData && plusStatusData.membershipTier && (
        <SuggestionVouchModal
          canSuggest={!suggestionsLoading && !ownSuggestion}
          canVouch={!!plusStatusData.canVouchFor}
          userPlusMembershipTier={plusStatusData.membershipTier}
        />
      )}
      <Center mt={6}>
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
      {!suggestionsLoading &&
      suggestionCounts.ONE + suggestionCounts.TWO + suggestionCounts.THREE ===
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
              <Fragment key={suggestion.suggestedUser.id}>
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

export default PlusHomePage;
