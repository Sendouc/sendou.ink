import { useQuery } from "@apollo/react-hooks"
import { Box, Divider, Flex } from "@chakra-ui/core"
import { RouteComponentProps, useLocation } from "@reach/router"
import React, { useContext, useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Trans, useTranslation } from "react-i18next"
import { FaFilter } from "react-icons/fa"
import {
  UpcomingEventsData,
  UPCOMING_EVENTS,
} from "../../graphql/queries/upcomingEvents"
import MyThemeContext from "../../themeContext"
import { getWeek } from "../../utils/helperFunctions"
import { days } from "../../utils/lists"
import Error from "../common/Error"
import Loading from "../common/Loading"
import PageHeader from "../common/PageHeader"
import SubHeader from "../common/SubHeader"
import Input from "../elements/Input"
import TournamentInfo from "./TournamentInfo"

const badgeColor: { [key: string]: string } = {
  Friday: "purple",
  Saturday: "green",
  Sunday: "blue",
} as const

const CalendarPage: React.FC<RouteComponentProps> = () => {
  const { darkerBgColor, grayWithShade } = useContext(MyThemeContext)
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const matchingRef = useRef<HTMLDivElement>(null)
  const { data, error, loading } = useQuery<UpcomingEventsData>(UPCOMING_EVENTS)
  const [filter, setFilter] = useState("")

  const searchParamsEventName = new URLSearchParams(location.search).get("name")

  useEffect(() => {
    if (!matchingRef?.current) return

    matchingRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
  })

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  const events = data!.upcomingEvents

  let lastPrintedWeek: number | null = null
  let lastPrintedDay: number | null = null
  let lastPrintedMonth: number | null = null
  const thisWeekNumber = getWeek(new Date())

  const filteredTournaments = events.filter(
    (event) =>
      event.name.toLowerCase().includes(filter.toLowerCase()) ||
      `${event.poster_discord_user.username}#${event.poster_discord_user.discord_id}`
        .toLowerCase()
        .includes(filter.toLowerCase())
  )

  const timeNow = new Date().toTimeString()

  return (
    <>
      <Helmet>
        <title>{t("calendar;Competitive Calendar")} | sendou.ink</title>
      </Helmet>
      <PageHeader title={t("calendar;Competitive Calendar")} />
      <Input
        value={filter}
        setValue={(value) => setFilter(value)}
        label={t("calendar;Filter tournaments")}
        icon={FaFilter}
      />
      {filteredTournaments.map((event) => {
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
            {printWeekHeader ? (
              <Box my="2em">
                <SubHeader>
                  <Trans i18nKey="calendar;weekNumber">
                    Week {{ weekNumber }}
                  </Trans>{" "}
                  {thisWeekNumber === weekNumber && (
                    <>({t("calendar;This week")})</>
                  )}
                </SubHeader>
              </Box>
            ) : (
              <Divider my="2em" />
            )}
            {printDayHeader && (
              <Flex
                bg={darkerBgColor}
                borderRadius="5px"
                p="0.5em"
                my="1.5em"
                alignItems="center"
                textTransform="capitalize"
              >
                {new Date(parseInt(event.date)).toLocaleString(i18n.language, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Flex>
            )}
            <div
              ref={
                event.name === searchParamsEventName ? matchingRef : undefined
              }
            >
              <TournamentInfo
                tournament={event}
                date={time}
                expandedByDefault={event.name === searchParamsEventName}
              />
            </div>
          </React.Fragment>
        )
      })}
      <Divider my="2em" />
      <Box color={grayWithShade}>
        <Trans i18nKey="calendar;footer">
          All events listed in your local time: {{ timeNow }}
          <p style={{ marginTop: "0.5em" }}>
            If you want your event displayed here message Sendou#0043 on Discord
          </p>
        </Trans>
      </Box>
    </>
  )
}

export default CalendarPage
