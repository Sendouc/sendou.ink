import { Button, Link } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";

const SalmonRunLeaderboardsPage = ({}) => {
  return (
    <>
      <Breadcrumbs
        pages={[{ name: t`Salmon Run` }, { name: t`Leaderboards` }]}
      />
      <Link href="/sr/leaderboards/new">
        <a>
          <Button variant="outline">
            <Trans>Submit result</Trans>
          </Button>
        </a>
      </Link>
    </>
  );
};

export default SalmonRunLeaderboardsPage;
