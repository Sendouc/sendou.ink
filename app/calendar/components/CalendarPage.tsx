import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box } from "@chakra-ui/layout";
import { t, Trans } from "@lingui/macro";
import SubText from "components/common/SubText";
import { useMyTheme } from "hooks/common";
import { Fragment, useState } from "react";
import { trpc } from "utils/trpc";
import EventInfo from "./EventInfo";
import { EventModal, FormData } from "./EventModal";

export default function CalendarPage() {
  const { gray } = useMyTheme();
  const events = trpc.useQuery(["calendar.events"], { enabled: false });
  const [eventToEdit, setEventToEdit] = useState<
    boolean | (FormData & { id: number })
  >(false);
  const [filter, setFilter] = useState("");

  let lastPrintedDate: [number, number, Date] | null = null;

  if (process.env.NODE_ENV === "production") return null;

  return (
    <>
      <div>
        <Button size="sm" onClick={() => setEventToEdit(true)}>
          <Trans>Add event</Trans>
        </Button>
        {eventToEdit && (
          <EventModal
            onClose={() => setEventToEdit(false)}
            event={typeof eventToEdit === "boolean" ? undefined : eventToEdit}
            refetchQuery={events.refetch}
          />
        )}
      </div>
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        mt={8}
      />
      {(events.data ?? []).map((event) => {
        const printDateHeader =
          !lastPrintedDate ||
          lastPrintedDate[0] !== event.date.getDate() ||
          lastPrintedDate[1] !== event.date.getMonth();

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
              <EventInfo
                event={event}
                edit={() =>
                  setEventToEdit({
                    ...event,
                    date: event.date.toISOString(),
                    // TODO: remove this if later other event types than tournament are allowed
                    // currently in the validator we accept the properties as if you can only submit
                    // tournaments but database is prepared to accept other kind of events
                    // this makes TS freak out a bit
                    discordInviteUrl: event.discordInviteUrl!,
                    tags: event.tags as any,
                    format: event.format as any,
                  })
                }
              />
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
