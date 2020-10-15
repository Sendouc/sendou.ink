import { useQuery } from "@apollo/client";
import { Badge, Box, Button, Divider, Flex, Grid } from "@chakra-ui/core";
import { Link } from "@reach/router";
import React, { useContext, useState } from "react";
import { PlusInfoData, PLUS_INFO } from "../../graphql/queries/plusInfo";
import {
  Suggestion,
  SUGGESTIONS,
  SuggestionsData,
} from "../../graphql/queries/suggestions";
import { USER } from "../../graphql/queries/user";
import { VOUCHES } from "../../graphql/queries/vouches";
import MyThemeContext from "../../themeContext";
import { UserData } from "../../types";
import Error from "../common/Error";
import Loading from "../common/Loading";
import SubHeader from "../common/SubHeader";
import UserAvatar from "../common/UserAvatar";
import Alert from "../elements/Alert";
import SuggestionVouchModal from "./SuggestionVouchModal";

interface VouchUser {
  username: string;
  discriminator: string;
  avatar?: string;
  discord_id: string;
  plus: {
    voucher_user: {
      username: string;
      discriminator: string;
      discord_id: string;
    };
    vouch_status: string;
  };
}

interface VouchesData {
  vouches: VouchUser[];
}

const Suggestions = () => {
  const { grayWithShade, themeColor } = useContext(MyThemeContext);

  const { data, error, loading } = useQuery<SuggestionsData>(SUGGESTIONS);
  const {
    data: vouchesData,
    error: vouchesError,
    loading: vouchesLoading,
  } = useQuery<VouchesData>(VOUCHES);
  const { data: userData, error: userError } = useQuery<UserData>(USER);
  const { data: plusInfoData, error: plusInfoError } = useQuery<PlusInfoData>(
    PLUS_INFO
  );

  const [showSuggestionForm, setShowSuggestionForm] = useState(false);

  if (error) return <Error errorMessage={error.message} />;
  if (userError) return <Error errorMessage={userError.message} />;
  if (plusInfoError) return <Error errorMessage={plusInfoError.message} />;
  if (vouchesError) return <Error errorMessage={vouchesError.message} />;
  if (loading || vouchesLoading || !data || !vouchesData) return <Loading />;
  if (!data.suggestions) return null;

  const plusOneVouches = vouchesData.vouches.filter(
    (vouch) => vouch.plus.vouch_status === "ONE"
  );
  const plusTwoVouches = vouchesData.vouches.filter(
    (vouch) => vouch.plus.vouch_status === "TWO"
  );

  const plusOneSuggested = data.suggestions.filter(
    (suggestion) => suggestion.plus_server === "ONE"
  );
  const plusTwoSuggested = data.suggestions.filter(
    (suggestion) => suggestion.plus_server === "TWO"
  );

  const vouchMap = (vouch: VouchUser) => {
    return (
      <React.Fragment key={vouch.discord_id}>
        <Flex mr="0.5rem" alignItems="center">
          <UserAvatar src={vouch.avatar} name={vouch.username} size="sm" />
        </Flex>
        <Box>
          <Box as="span" fontWeight="bold">
            <Link to={`/u/${vouch.discord_id}`}>
              {vouch.username}#{vouch.discriminator}
            </Link>
          </Box>{" "}
          <Box color={grayWithShade} fontSize="0.9rem">
            by {vouch.plus.voucher_user.username}#
            {vouch.plus.voucher_user.discriminator}
          </Box>
        </Box>
      </React.Fragment>
    );
  };

  const suggestionMap = (suggestion: Suggestion, index: number) => {
    const suggested_user = suggestion.discord_user;
    const suggester_user = suggestion.suggester_discord_user;
    return (
      <React.Fragment key={suggestion.discord_user.discord_id}>
        {index !== 0 && <Divider my="1rem" />}
        <Flex mr="1em" mt="1rem" alignItems="center">
          <UserAvatar
            src={suggested_user.avatar}
            name={suggested_user.username}
            size="sm"
            mr="0.5rem"
          />
          <Box as="span" fontWeight="bold">
            <Link to={`/u/${suggested_user.discord_id}`}>
              {suggested_user.username}#{suggested_user.discriminator}
            </Link>
          </Box>
        </Flex>
        <Box m="0.5rem">
          <Box display="inline-block" color={grayWithShade} fontSize="0.9rem">
            {suggester_user.username}#{suggester_user.discriminator}:
          </Box>{" "}
          {suggestion.description}
        </Box>
      </React.Fragment>
    );
  };

  const user = userData?.user;

  const ownSuggestion = data.suggestions.find(
    (suggestion) =>
      suggestion.suggester_discord_user.discord_id === user?.discord_id
  );

  const canSuggest = !ownSuggestion;

  const canVouch =
    !!user?.plus?.can_vouch && !user?.plus?.can_vouch_again_after;

  const canVouchAgainAfterString = user?.plus?.can_vouch_again_after
    ? new Date(
        parseInt(user.plus.can_vouch_again_after)
      ).toLocaleDateString("en", { month: "long" })
    : null;

  const getButtonText = () => {
    // can't suggest or vouch if voting is underway OR is not plus server member
    if (
      plusInfoData?.plusInfo?.voting_ends ||
      !userData?.user?.plus?.membership_status
    )
      return undefined;

    if (canSuggest && canVouch) return "Suggest or vouch a player";
    else if (canSuggest) return "Suggest a player";
    else if (canVouch) return "Vouch a player";
  };

  const buttonText = getButtonText();

  return (
    <>
      {showSuggestionForm && (
        <SuggestionVouchModal
          closeModal={() => setShowSuggestionForm(false)}
          canSuggest={canSuggest}
          canVouch={canVouch}
          plusServer={user?.plus?.membership_status!}
        />
      )}

      {buttonText && (
        <Button mb="0.5rem" onClick={() => setShowSuggestionForm(true)}>
          {buttonText}
        </Button>
      )}
      {canVouchAgainAfterString && (
        <Alert status="warning" my={4}>
          Due to your vouch getting kicked you need to wait till at least{" "}
          {canVouchAgainAfterString}'s voting is over to vouch again
        </Alert>
      )}
      {plusOneVouches.length === 0 &&
        plusTwoVouches.length === 0 &&
        plusOneSuggested.length === 0 &&
        plusTwoSuggested.length === 0 && (
          <Alert status="info">No suggestions or vouches yet this month</Alert>
        )}
      {plusOneVouches.length > 0 && (
        <>
          <SubHeader>
            Vouched to +1{" "}
            <Badge colorScheme={themeColor} ml="0.5em">
              {plusOneVouches.length}
            </Badge>
          </SubHeader>
          <Grid
            gridRowGap="0.5em"
            gridTemplateColumns="min-content 1fr"
            mt="1em"
          >
            {plusOneVouches.map(vouchMap)}
          </Grid>
        </>
      )}
      {plusTwoVouches.length > 0 && (
        <Box mt="1em">
          <SubHeader>
            Vouched to +2{" "}
            <Badge colorScheme={themeColor} ml="0.5em">
              {plusTwoVouches.length}
            </Badge>
          </SubHeader>
          <Grid
            gridRowGap="0.5em"
            gridTemplateColumns="min-content 1fr"
            mt="1em"
          >
            {plusTwoVouches.map(vouchMap)}
          </Grid>
        </Box>
      )}
      {plusOneSuggested.length > 0 && (
        <Box mt="1em">
          <SubHeader>
            Suggested to +1{" "}
            <Badge colorScheme={themeColor} ml="0.5em">
              {plusOneSuggested.length}
            </Badge>
          </SubHeader>
          {plusOneSuggested.map(suggestionMap)}
        </Box>
      )}
      {plusTwoSuggested.length > 0 && (
        <Box mt="1em">
          <SubHeader>
            Suggested to +2{" "}
            <Badge colorScheme={themeColor} ml="0.5em">
              {plusTwoSuggested.length}
            </Badge>
          </SubHeader>
          {plusTwoSuggested.map(suggestionMap)}
        </Box>
      )}
    </>
  );
};

export default Suggestions;
