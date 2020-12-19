import { Alert, AlertIcon, Box, Button } from "@chakra-ui/react";
import { Plural, t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import { useSalmonRunRecords } from "hooks/sr";
import Link from "next/link";

const SalmonRunLeaderboardsPage = ({}) => {
  const { data, pendingCount } = useSalmonRunRecords();
  console.log({ data, pendingCount });
  return (
    <>
      <Breadcrumbs
        pages={[{ name: t`Salmon Run` }, { name: t`Leaderboards` }]}
      />
      {pendingCount && (
        <Alert status="info" my={4}>
          <AlertIcon />
          <Plural
            value={pendingCount}
            one={<Trans>You have one record waiting for approval</Trans>}
            other={<Trans>You have # records waiting for approval</Trans>}
          />
        </Alert>
      )}
      <Link href="/sr/leaderboards/new">
        <a>
          <Button variant="outline">
            <Trans>Submit result</Trans>
          </Button>
        </a>
      </Link>
      <Box as="pre" mt={2}>
        {JSON.stringify(data)}
      </Box>
    </>
  );
};

export default SalmonRunLeaderboardsPage;
