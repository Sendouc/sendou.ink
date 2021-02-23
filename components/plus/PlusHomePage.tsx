import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { Trans } from "@lingui/macro";
import SuggestionVouchModal from "./SuggestionVouchModal";

export interface PlusHomePageProps {}

const PlusHomePage: React.FC<PlusHomePageProps> = () => {
  return (
    <>
      <SuggestionVouchModal
        canSuggest={true}
        canVouch={false}
        userPlusMembershipTier={1}
      />
      <Box>No suggestions yet for this month</Box>
    </>
  );
};

export default PlusHomePage;
