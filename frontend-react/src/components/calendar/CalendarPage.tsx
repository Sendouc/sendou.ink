import React, { useContext } from "react"
import { useQuery } from "@apollo/react-hooks"
import {
  UPCOMING_EVENTS,
  UpcomingEventsData,
} from "../../graphql/queries/upcomingEvents"
import { RouteComponentProps } from "@reach/router"
import PageHeader from "../common/PageHeader"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { getWeek, ordinal_suffix_of } from "../../utils/helperFunctions"
import SubHeader from "../common/SubHeader"
import { Box, Badge, Flex, Divider } from "@chakra-ui/core"
import { months, days } from "../../utils/lists"
import MyThemeContext from "../../themeContext"
import TournamentInfo from "./TournamentInfo"

const badgeColor: { [key: string]: string } = {
  Friday: "purple",
  Saturday: "green",
  Sunday: "blue",
} as const

const CalendarPage: React.FC<RouteComponentProps> = () => {
  const { darkerBgColor, grayWithShade } = useContext(MyThemeContext)
  const { data, error, loading } = useQuery<UpcomingEventsData>(UPCOMING_EVENTS)

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  const events = data!.upcomingEvents

  let lastPrintedWeek: number | null = null
  let lastPrintedDay: number | null = null
  let lastPrintedMonth: number | null = null
  const thisWeekNumber = getWeek(new Date())
  return (
    <>
      <PageHeader title="Competitive Calendar" />
      {events.map((event) => {
        const time = new Date(parseInt(event.date))
        const weekNumber = getWeek(time)
        const thisDay = time.getDate()
        const thisDayOfTheWeek = days[time.getDay()]
        const thisMonth = time.getMonth()
        const printWeekHeader = weekNumber !== lastPrintedWeek
        const printDayHeader =
          thisDay !== lastPrintedDay || thisMonth !== lastPrintedMonth
        if (printWeekHeader) {
          lastPrintedWeek = weekNumber
        }
        if (printDayHeader) {
          lastPrintedDay = thisDay
          lastPrintedMonth = thisMonth
        }

        const colorForBadge = badgeColor[thisDayOfTheWeek] ?? "red"

        return (
          <React.Fragment key={event.discord_invite_url}>
            {printWeekHeader && (
              <Box my="2em">
                <SubHeader>
                  Week {weekNumber}{" "}
                  {thisWeekNumber === weekNumber && <>(This week)</>}
                </SubHeader>
              </Box>
            )}
            {printDayHeader && (
              <Flex
                bg={darkerBgColor}
                borderRadius="5px"
                p="0.5em"
                my="1.5em"
                alignItems="center"
              >
                {months[thisMonth + 1]} {thisDay}
                {ordinal_suffix_of(thisDay)}
                <Badge ml="1em" variantColor={colorForBadge}>
                  {thisDayOfTheWeek}
                </Badge>
              </Flex>
            )}
            <TournamentInfo tournament={event} date={time} />
          </React.Fragment>
        )
      })}
      <Divider my="2em" />
      <Box color={grayWithShade}>
        All events listed in your local time: {new Date().toTimeString()}
        <p style={{ marginTop: "0.5em" }}>
          If you want your event displayed here message Sendou#0043 on Discord
        </p>
      </Box>
    </>
  )
}

export default CalendarPage
