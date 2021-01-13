import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import MyContainer from "components/common/MyContainer";
import CreateNewTeamModal from "components/t/CreateNewTeamModal";

interface Props {}

const TeamsPage: React.FC<Props> = ({}) => {
  return (
    <MyContainer>
      <Breadcrumbs pages={[{ name: t`Teams` }]} />
      <CreateNewTeamModal />
    </MyContainer>
  );
};

export default TeamsPage;
