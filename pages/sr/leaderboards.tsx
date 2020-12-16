import { Button } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import AddRecordModal from "components/sr/AddRecordModal";
import { useState } from "react";

const SalmonRunLeaderboardsPage = ({}) => {
  const [showModal, setShowModal] = useState(true);

  return (
    <>
      {showModal && <AddRecordModal onClose={() => setShowModal(false)} />}
      <Breadcrumbs
        pages={[{ name: t`Salmon Run` }, { name: t`Leaderboards` }]}
      />
      <Button variant="outline" onClick={() => setShowModal(true)}>
        <Trans>Submit result</Trans>
      </Button>
    </>
  );
};

export default SalmonRunLeaderboardsPage;
