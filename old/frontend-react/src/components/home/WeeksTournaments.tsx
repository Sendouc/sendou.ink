import { useQuery } from "@apollo/client";
import { Box, Button, Flex, Heading } from "@chakra-ui/core";
import { Link } from "@reach/router";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiClock, FiInfo } from "react-icons/fi";
import {
  UpcomingEventsData,
  UPCOMING_EVENTS
} from "../../graphql/queries/upcomingEvents";
import MyThemeContext from "../../themeContext";
import { getWeek } from "../../utils/helperFunctions";
import Error from "../common/Error";
import Loading from "../common/Loading";
import SubHeader from "../common/SubHeader";

const WeeksTournaments: React.FC = () => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext);
  const { data, error, loading } = useQuery<UpcomingEventsData>(
    UPCOMING_EVENTS
  );
  const { t } = useTranslation();

  if (loading) return <Loading />;
  if (error) return <Error errorMessage={error.message} />;

  const thisWeekNumber = getWeek(new Date());

  const events = data!.upcomingEvents.filter(
    (event) => getWeek(new Date(parseInt(event.date))) === thisWeekNumber
  );

  if (events.length === 0) return null;

  return (
    <>
      <SubHeader>{t("home;Play in competitive events this week")}</SubHeader>
      <Flex alignItems="center" flexDirection="column">
        {events.map((tournament) => (
          <Box
            key={tournament.discord_invite_url}
            my="0.5em"
            textAlign="center"
          >
            <Heading fontFamily="'Rubik', sans-serif" size="md">
              {tournament.name}
            </Heading>
            <Flex
              alignItems="center"
              justifyContent="center"
              color={grayWithShade}
            >
              <Box as={FiClock} mr="0.5em" color={themeColorWithShade} />
              {new Date(parseInt(tournament.date)).toLocaleString()}
            </Flex>
          </Box>
        ))}
        <Box mt="1em">
          <Link to="/calendar">
            <Button variant="outline" leftIcon={<FiInfo />}>
              {t("home;View more info")}
            </Button>
          </Link>
        </Box>
      </Flex>
    </>
  );
};

export default WeeksTournaments;
