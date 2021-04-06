import CalendarPage from "app/calendar/components/CalendarPage";
import HeaderBanner from "components/layout/HeaderBanner";
import { ssr } from "pages/api/trpc/[trpc]";

export const getStaticProps = async () => {
  await ssr.prefetchQuery("calendar.events");

  return {
    props: {
      dehydratedState: ssr.dehydrate(),
    },
    revalidate: 60,
  };
};

// @ts-expect-error
CalendarPage.header = (
  <HeaderBanner
    icon="calendar"
    title="Calendar"
    subtitle="Upcoming tournaments and other events."
  />
);

export default CalendarPage;
