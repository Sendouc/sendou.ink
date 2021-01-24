import { Box } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import MyContainer from "components/common/MyContainer";
import RegisterHeader from "components/play/RegisterHeader";
import { useLadderTeams } from "hooks/play";

const PlayPage = () => {
  const { data } = useLadderTeams();

  console.log({ data });
  return (
    <MyContainer>
      <Breadcrumbs pages={[{ name: t`Play` }]} />
      <Box fontSize="lg" fontWeight="bold">
        Next event: testing
      </Box>
      <RegisterHeader />
    </MyContainer>
  );
};

export default PlayPage;
