import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";

interface Props {}

const FreeAgentsPage: React.FC<Props> = ({}) => {
  return (
    <>
      <Breadcrumbs pages={[{ name: t`Free Agents` }]} />
    </>
  );
};

export default FreeAgentsPage;
