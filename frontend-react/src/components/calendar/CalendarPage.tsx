import { useQuery } from "@apollo/react-hooks"
import { Box } from "@chakra-ui/core"
import { RouteComponentProps, useLocation } from "@reach/router"
import React, { useContext, useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Trans, useTranslation } from "react-i18next"
import {
  UpcomingEventsData,
  UPCOMING_EVENTS,
} from "../../graphql/queries/upcomingEvents"
import MyThemeContext from "../../themeContext"
import { getWeek } from "../../utils/helperFunctions"
import Error from "../common/Error"
import Loading from "../common/Loading"
import PageHeader from "../common/PageHeader"
import SubHeader from "../common/SubHeader"
import Input from "../elements/Input"
import TournamentInfo from "./TournamentInfo"

const CalendarPage: React.FC<RouteComponentProps> = () => {
  const { grayWithShade } = useContext(MyThemeContext)
  const { t } = useTranslation()

  const [filter, setFilter] = useState("")

  const location = useLocation()
  const matchingRef = useRef<HTMLDivElement>(null)

  const { data, error, loading } = useQuery<UpcomingEventsData>(UPCOMING_EVENTS)

  const searchParamsEventName = new URLSearchParams(location.search).get("name")

  useEffect(() => {
    if (!matchingRef?.current) return

    matchingRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
  })

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  const events = data!.upcomingEvents

  let lastPrintedWeek: number | null = null
  const thisWeekNumber = getWeek(new Date())

  const timeNow = new Date().toTimeString()

  const filteredTournaments = events.filter(
    (event) =>
      event.name.toLowerCase().includes(filter.toLowerCase()) ||
      `${event.poster_discord_user.username}#${event.poster_discord_user.discord_id}`
        .toLowerCase()
        .includes(filter.toLowerCase())
  )

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
        m="3rem 0 2rem"
      />
      {filteredTournaments.map((event) => {
        const time = new Date(parseInt(event.date))
        const weekNumber = getWeek(time)
        const printWeekHeader = weekNumber !== lastPrintedWeek

        if (printWeekHeader) {
          lastPrintedWeek = weekNumber
        }

        return (
          <React.Fragment key={event.name}>
            {printWeekHeader && (
              <Box my={10}>
                <SubHeader>
                  <Trans i18nKey="calendar;weekNumber">
                    Week {{ weekNumber }}
                  </Trans>{" "}
                  {thisWeekNumber === weekNumber && (
                    <>({t("calendar;This week")})</>
                  )}
                </SubHeader>
              </Box>
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
