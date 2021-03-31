import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box } from "@chakra-ui/layout";
import { t, Trans } from "@lingui/macro";
import SubText from "components/common/SubText";
import { useMyTheme } from "hooks/common";
import { Fragment, useState } from "react";
import { trpc } from "utils/trpc";
import EventInfo from "./EventInfo";
import { EventModal } from "./EventModal";

export default function CalendarPage() {
  const { gray } = useMyTheme();
  const events = trpc.useQuery(["calendar.events"], { enabled: false });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [filter, setFilter] = useState("");

  let lastPrintedDate: [number, number, Date] | null = null;

  return (
    <>
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
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        m="3rem 0 2rem"
      />
      {(events.data ?? []).map((event) => {
        const printDateHeader =
          !lastPrintedDate ||
          (lastPrintedDate[0] !== event.date.getDate() &&
            lastPrintedDate[1] !== event.date.getMonth());

        if (printDateHeader) {
          lastPrintedDate = [
            event.date.getDate(),
            event.date.getMonth(),
            event.date,
          ];
        }

        const differenceInDays = Math.floor(
          (lastPrintedDate![2].getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return (
          <Fragment key={event.id}>
            {printDateHeader && (
              <Box my={10}>
                <SubText>
                  {event.date.toLocaleDateString()} {getTime(differenceInDays)}
                </SubText>
              </Box>
            )}
            <div>
              <EventInfo event={event} />
            </div>
          </Fragment>
        );
      })}
      <Box color={gray}>
        All events listed in your local time:{" "}
        {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </Box>
    </>
  );
}

function getTime(days: number) {
  if (days < 1) return t`(Today)`;
  if (days === 1) return t`(Tomorrow)`;

  return "";
}
