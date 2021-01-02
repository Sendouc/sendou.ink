import { Button } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import FAModal from "components/freeagents/FAModal";
import { useState } from "react";

interface Props {}

const FreeAgentsPage: React.FC<Props> = ({}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  return (
    <>
      {modalIsOpen && <FAModal onClose={() => setModalIsOpen(false)} />}
      <Breadcrumbs pages={[{ name: t`Free Agents` }]} />
      <Button onClick={() => setModalIsOpen(true)}>
        <Trans>New free agent post</Trans>
      </Button>
    </>
  );
};

export default FreeAgentsPage;
