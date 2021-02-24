import { Button } from "@chakra-ui/button";
import { Box, Center, Divider, Flex, Stack } from "@chakra-ui/layout";
import { Radio, RadioGroup } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import UserAvatar from "components/common/UserAvatar";
import { usePlus } from "hooks/plus";
import { getFullUsername } from "lib/strings";
import { Fragment } from "react";
import SuggestionVouchModal from "./SuggestionVouchModal";

export interface PlusHomePageProps {}

const PlusHomePage: React.FC<PlusHomePageProps> = () => {
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
          canSuggest={!ownSuggestion}
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
            <Radio value="THREE">
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
            return (
              <Fragment key={suggestion.suggestedUser.id}>
                <Box as="section" my={8}>
                  <Flex
                    alignItems="center"
                    fontWeight="bold"
                    fontSize="1.25rem"
                  >
                    <UserAvatar user={suggestion.suggestedUser} mr={3} />
                    <MyLink
                      href={`/u/${suggestion.suggestedUser.discordId}`}
                      isColored={false}
                    >
                      {getFullUsername(suggestion.suggestedUser)}
                    </MyLink>
                  </Flex>
                  <SubText ml={2} mt={2}>
                    +{suggestion.tier}
                  </SubText>
                  <Box ml={2} mt={4} fontSize="sm">
                    "{suggestion.description}" -{" "}
                    <MyLink
                      href={`/u/${suggestion.suggesterUser.discordId}`}
                      isColored={false}
                    >
                      {getFullUsername(suggestion.suggesterUser)}
                    </MyLink>
                  </Box>
                  {suggestion.resuggestions?.map((resuggestion) => {
                    return (
                      <Box
                        key={resuggestion.suggesterUser.id}
                        ml={2}
                        mt={4}
                        fontSize="sm"
                      >
                        "{resuggestion.description}" -{" "}
                        <MyLink
                          href={`/u/${resuggestion.suggesterUser.discordId}`}
                          isColored={false}
                        >
                          {getFullUsername(resuggestion.suggesterUser)}
                        </MyLink>
                      </Box>
                    );
                  })}
                </Box>
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
