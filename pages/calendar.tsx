import { Button } from "@chakra-ui/button";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Box } from "@chakra-ui/layout";
import {
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import EventInfo from "components/calendar/EventInfo";
import { EventModal, FormData } from "components/calendar/EventModal";
import Calendar from "components/common/Calendar";
import MyHead from "components/common/MyHead";
import SubText from "components/common/SubText";
import { useMyTheme, useUser } from "hooks/common";
import { ssr } from "pages/api/trpc/[trpc]";
import { Fragment, ReactNode, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { trpc } from "utils/trpc";

const CalendarPage = () => {
  const { gray, secondaryBgColor } = useMyTheme();
  const events = trpc.useQuery(["calendar.events"], { enabled: false });
  const [eventToEdit, setEventToEdit] = useState<
    boolean | (FormData & { id: number })
  >(false);
  const [{ month, year }, setMonthYear] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [user] = useUser();

  let lastPrintedDate: [number, number, Date] | null = null;

  const scrollToEvent = (id: number) => {
    document
      .getElementById(`event-${id}`)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const eventsInFuture = Boolean(
    events.data?.some(
      (event) =>
        event.date.getMonth() + 1 > month || event.date.getFullYear() > year
    )
  );

  const calendarDateContents = useMemo(() => {
    return (events.data ?? []).reduce(
      (result: Record<string, ReactNode[]>, event) => {
        const key = `${event.date.getDate()}-${
          event.date.getMonth() + 1
        }-${event.date.getFullYear()}`;
        const node = (
          <Fragment key={event.id}>
            <Button
              display="block"
              mx="auto"
              size="xs"
              variant="ghost"
              textOverflow="ellipsis"
              maxW="150px"
              width="100%"
              height="2rem"
              mt="0.25rem"
              mb="0.5rem"
              overflow="hidden"
              onClick={() => {
                scrollToEvent(event.id);
              }}
            >
              <Badge display="block" size="xs" colorScheme="gray" mb="0.25rem">
                {event.date.toLocaleTimeString("en", { hour: "numeric" })}
              </Badge>
              {event.name}
            </Button>
          </Fragment>
        );
        if (result[key]) result[key].push(node);
        else result[key] = [node];

        return result;
      },
      {}
    );
  }, [events.data]);

  return (
    <>
      <MyHead title={t`Calendar`} />
      {eventToEdit && (
        <EventModal
          onClose={() => setEventToEdit(false)}
          event={typeof eventToEdit === "boolean" ? undefined : eventToEdit}
          refetchQuery={events.refetch}
        />
      )}
      {user && (
        <Box mb={6}>
          <Button
            size="sm"
            onClick={() => setEventToEdit(true)}
            data-cy="add-event-button"
          >
            <Trans>Add event</Trans>
          </Button>
        </Box>
      )}
      <Calendar
        current={{ month, year }}
        min={{ month: 7, year: 2021 }}
        handleNextClick={() =>
          setMonthYear(
            month === 12
              ? { month: 1, year: year + 1 }
              : { month: month + 1, year }
          )
        }
        handleBackClick={() =>
          setMonthYear(
            month === 1
              ? { month: 12, year: year - 1 }
              : { month: month - 1, year }
          )
        }
        showNextButton={eventsInFuture}
        dateContents={calendarDateContents}
      />
      {(events.data ?? [])
        .filter(
          (event) =>
            event.date.getMonth() + 1 === month &&
            event.date.getFullYear() === year
        )
        .map((event, i) => {
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

          const timeUntilDateInDays = ((date: Date) => {
            const now = new Date();
            const diff = date.getTime() - now.getTime();
            const day = Math.floor(diff / (1000 * 3600 * 24));
            return day;
          })(lastPrintedDate![2]);

          return (
            <Fragment key={event.id}>
              {printDateHeader && (
                <Box mt={i === 0 ? 0 : 10}>
                  <SubText>
                    {/* TODO */}
                    {event.date.toLocaleDateString("en", {
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}{" "}
                    {isToday && <Trans>(Today)</Trans>}
                    {timeUntilDateInDays > 1 && (
                      <>(In {timeUntilDateInDays} days)</>
                    )}
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
      <Box color={gray} mt={10}>
        All events listed in your local time:{" "}
        {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </Box>
    </>
  );
};

export const getStaticProps = async () => {
  await ssr.prefetchQuery("calendar.events");

  return {
    props: {
      dehydratedState: ssr.dehydrate(),
    },
    revalidate: 60,
  };
};

export default CalendarPage;
