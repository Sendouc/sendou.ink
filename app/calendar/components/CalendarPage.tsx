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

  console.log("events", events.data);

  let lastPrintedWeek: number | null = null;
  const thisWeekNumber = getWeekNumber(new Date());

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
        const weekNumber = getWeekNumber(event.date);
        const printWeekHeader = weekNumber !== lastPrintedWeek;

        if (printWeekHeader) {
          lastPrintedWeek = weekNumber;
        }

        return (
          <Fragment key={event.id}>
            {printWeekHeader && (
              <Box my={10}>
                <SubText>
                  Week {weekNumber}{" "}
                  {thisWeekNumber === weekNumber && <>({t`This week`})</>}
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

function getWeekNumber(d: Date) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  // Return array of year and week number
  return weekNo;
}
