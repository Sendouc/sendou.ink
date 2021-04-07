import { Button } from "@chakra-ui/button";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Box } from "@chakra-ui/layout";
import { t, Trans } from "@lingui/macro";
import SubText from "components/common/SubText";
import { useMyTheme } from "hooks/common";
import { Fragment, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { trpc } from "utils/trpc";
import EventInfo from "./EventInfo";
import { EventModal, FormData } from "./EventModal";
import MyHead from "../../../components/common/MyHead";

export default function CalendarPage() {
  const { gray } = useMyTheme();
  const events = trpc.useQuery(["calendar.events"], { enabled: false });
  const [eventToEdit, setEventToEdit] = useState<
    boolean | (FormData & { id: number })
  >(false);
  const [filter, setFilter] = useState("");

  let lastPrintedDate: [number, number, Date] | null = null;

  return (
    <>
      <MyHead title={t`Calendar`} />
      <div>
        <Button
          size="sm"
          onClick={() => setEventToEdit(true)}
          data-cy="add-event-button"
        >
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
      <InputGroup mt={8} maxW="24rem" mx="auto">
        <InputLeftElement
          pointerEvents="none"
          children={<FiSearch color={gray} />}
        />
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} />
      </InputGroup>
      {(events.data ?? [])
        .filter((event) =>
          event.name.toLowerCase().includes(filter.toLowerCase().trim())
        )
        .map((event) => {
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

          const now = new Date();

          const isToday =
            lastPrintedDate![2].getDate() === now.getDate() &&
            lastPrintedDate![2].getMonth() === now.getMonth();

          return (
            <Fragment key={event.id}>
              {printDateHeader && (
                <Box my={10}>
                  <SubText>
                    {/* TODO */}
                    {event.date.toLocaleDateString("en", {
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}{" "}
                    {isToday && <Trans>(Today)</Trans>}
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
