// import fundamentals from "/lib/data/sr/fundamentals.md";
import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import Markdown from "components/common/Markdown";
import MyContainer from "components/common/MyContainer";
import fs from "fs";
import { join } from "path";

interface Props {
  fundamentals: string;
}

const SalmonRunGuidePage: React.FC<Props> = ({ fundamentals }) => {
  return (
    <MyContainer>
      <Breadcrumbs pages={[{ name: t`Salmon Run` }, { name: t`Guide` }]} />
      <Markdown value={fundamentals} allowAll />
    </MyContainer>
  );
};

export const getStaticProps = async () => {
  const fundamentals = fs
    .readFileSync(join(process.cwd(), "lib", "data", "sr", "fundamentals.md"))
    .toString();

  return { props: { fundamentals } };
};

export default SalmonRunGuidePage;
