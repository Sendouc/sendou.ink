import FreeAgentsPage from "app/freeagents/components/FreeAgentsPage";
import HeaderBanner from "components/layout/HeaderBanner";

// @ts-expect-error
FreeAgentsPage.header = (
  <HeaderBanner
    icon="freeagents"
    title="Free Agents"
    subtitle="Meet your next teammates"
  />
);

export default FreeAgentsPage;
