import HeaderBanner from "components/layout/HeaderBanner";
import TASLPage from "components/tasl/TASLPage";

// @ts-expect-error
TASLPage.header = (
  <HeaderBanner
    icon="tasl_main"
    title="TASL"
    subtitle="Transatlantic Splatoon League - Season 3"
  />
);

export default TASLPage;
