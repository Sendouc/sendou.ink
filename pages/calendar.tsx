import { Box } from "@chakra-ui/layout";
import { t, Trans } from "@lingui/macro";
import EventInfo from "components/calendar/EventInfo";
import { FormData } from "components/calendar/EventModal";
import MyHead from "components/common/MyHead";
import Page from "components/common/Page";
import SubText from "components/common/SubText";
import { useMyTheme } from "hooks/common";
import { ssr } from "pages/api/trpc/[trpc]";
import { Fragment, useState } from "react";
import { trpc } from "utils/trpc";

const CalendarPage = () => {
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
      <Page>
        {(events.data ?? [])
          .filter((event) =>
            event.name.toLowerCase().includes(filter.toLowerCase().trim())
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
      </Page>
      {/* <RightSidebar>
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
      </RightSidebar> */}
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
