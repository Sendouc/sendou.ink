import { useQuery } from "@apollo/react-hooks"
import { Box, Divider, Flex, Avatar } from "@chakra-ui/core"
import { RouteComponentProps, useLocation } from "@reach/router"
import React, { useContext, useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Trans, useTranslation } from "react-i18next"
import { FaFilter } from "react-icons/fa"
import {
  UpcomingEventsData,
  UPCOMING_EVENTS,
  CompetitiveFeedEvent,
} from "../../graphql/queries/upcomingEvents"
import MyThemeContext from "../../themeContext"
import { getWeek } from "../../utils/helperFunctions"
import Error from "../common/Error"
import Loading from "../common/Loading"
import PageHeader from "../common/PageHeader"
import SubHeader from "../common/SubHeader"
import Input from "../elements/Input"
import TournamentInfo from "./TournamentInfo"
import plusServerImage from "../../assets/plusServer.jpg"
import { UserData } from "../../types"
import { USER } from "../../graphql/queries/user"

const getFirstFridayDate = () => {
  const today = new Date()
  const month =
    today.getDate() < 7 && today.getDay() > 5
      ? today.getMonth()
      : today.getMonth() + 1

  let day = 1
  while (day <= 7) {
    const dateOfVoting = new Date(
      Date.UTC(today.getFullYear(), month, day, 15, 0, 0)
    )

    if (dateOfVoting.getDay() === 5) return "" + dateOfVoting.getTime()

    day++
  }

  console.error("Couldn't resolve first friday of the month for voting")
  return "" + new Date(2000, 1, 1).getTime()
}

const PLUS_VOTING_TEMPLATE: CompetitiveFeedEvent = {
  name: "",
  date: getFirstFridayDate(),
  description: "",
  message_url: "",
  message_discord_id: "",
  discord_invite_url: "",
  poster_discord_user: {
    username: "",
    discriminator: "",
    discord_id: "",
  },
  isVotingTemplate: true,
}

const CalendarPage: React.FC<RouteComponentProps> = () => {
  const { darkerBgColor, grayWithShade } = useContext(MyThemeContext)
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const matchingRef = useRef<HTMLDivElement>(null)

  const { data, error, loading } = useQuery<UpcomingEventsData>(UPCOMING_EVENTS)
  const { data: userData } = useQuery<UserData>(USER)

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

  const isPlusServerMember = !!userData?.user?.plus?.membership_status

  if (isPlusServerMember) {
    filteredTournaments.push(PLUS_VOTING_TEMPLATE)
    filteredTournaments.sort((a, b) => parseInt(a.date) - parseInt(b.date))
  }

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
        const thisMonth = time.getMonth()
        const printWeekHeader = weekNumber !== lastPrintedWeek

        /*const isFriday = time.getDay() === 5
        const isFirstFridayOfTheMonth = isFriday && thisDay <= 7
        const displayPlusServerVotingInfo = isPlusServerMember && isFirstFridayOfTheMonth*/

        const printDayHeader =
          thisDay !== lastPrintedDay || thisMonth !== lastPrintedMonth
        if (printWeekHeader) {
          lastPrintedWeek = weekNumber
        }
        if (printDayHeader) {
          lastPrintedDay = thisDay
          lastPrintedMonth = thisMonth
        }

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
            {event.isVotingTemplate ? (
              <Flex alignItems="center">
                <Avatar size="sm" src={plusServerImage} mr="0.5em" />{" "}
                <Trans i18nKey="calendar;plusVotingInfo">
                  <b style={{ marginRight: "0.2em" }}>Plus Server voting</b> of
                  the month starts and lasts for the weekend
                </Trans>
              </Flex>
            ) : (
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
            )}
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
