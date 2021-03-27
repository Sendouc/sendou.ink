import { Button } from "@chakra-ui/button";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import { trpc } from "utils/trpc";
import { EventModal } from "./EventModal";

export default function CalendarPage() {
  const events = trpc.useQuery(["calendar.events"], { enabled: false });
  const [modalIsOpen, setModalIsOpen] = useState(false);

  console.log("events", events.data);

  return (
    <div>
      <Button size="sm" onClick={() => setModalIsOpen(true)}>
        <Trans>Add event</Trans>
      </Button>
      {modalIsOpen && (
        <EventModal
          onClose={() => setModalIsOpen(false)}
          event={false}
          refetchQuery={events.refetch}
        />
      )}
    </div>
  );
}
