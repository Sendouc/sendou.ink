import { Button } from "@chakra-ui/button";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import { EventModal } from "./EventModal";

export default function CalendarPage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <div>
      <Button size="sm" onClick={() => setModalIsOpen(true)}>
        <Trans>Add event</Trans>
      </Button>
      {modalIsOpen && (
        <EventModal onClose={() => setModalIsOpen(false)} event={false} />
      )}
    </div>
  );
}
