import React, { useContext } from "react"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { useQuery } from "@apollo/react-hooks"
import {
  UpcomingEventsData,
  UPCOMING_EVENTS,
} from "../../graphql/queries/upcomingEvents"
import { getWeek } from "../../utils/helperFunctions"
import SubHeader from "../common/SubHeader"
import { Heading, Flex, Box } from "@chakra-ui/core"
import { FiClock, FiInfo } from "react-icons/fi"
import MyThemeContext from "../../themeContext"
import Button from "../elements/Button"
import { Link } from "@reach/router"

const WeeksTournaments: React.FC = () => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext)
  const { data, error, loading } = useQuery<UpcomingEventsData>(UPCOMING_EVENTS)

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  const thisWeekNumber = getWeek(new Date())

  const events = data!.upcomingEvents.filter(
    (event) => getWeek(new Date(parseInt(event.date))) === thisWeekNumber
  )

  if (events.length === 0) return null

  return (
    <>
      <SubHeader>Play in competitive events this week</SubHeader>
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
            <Flex alignItems="center" color={grayWithShade}>
              <Box as={FiClock} mr="0.5em" color={themeColorWithShade} />
              {new Date(parseInt(tournament.date)).toLocaleString()}
            </Flex>
          </Box>
        ))}
        <Box mt="1em">
          <Link to="/calendar">
            <Button outlined icon={FiInfo}>
              View more info
            </Button>
          </Link>
        </Box>
      </Flex>
    </>
  )
}

export default WeeksTournaments
