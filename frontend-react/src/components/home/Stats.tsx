import { useQuery } from "@apollo/react-hooks"
import { Box, Flex, Skeleton } from "@chakra-ui/core"
import { Link } from "@reach/router"
import React, { useContext } from "react"
import { STATS } from "../../graphql/queries/stats"
import MyThemeContext from "../../themeContext"
import Error from "../common/Error"
import { useTranslation, Trans } from "react-i18next"

interface StatsData {
  stats: {
    build_count: number
    tournament_count: number
    fa_count: number
    user_count: number
  }
}

const xRankMonths = () => {
  const date = new Date()
  const fullYears = date.getFullYear() - 2019
  return 8 + fullYears * 12 + date.getMonth()
}

const Stats: React.FC = () => {
  const { grayWithShade, themeColorWithShade } = useContext(MyThemeContext)
  const { data, error } = useQuery<StatsData>(STATS)
  const { t } = useTranslation()

  if (error) return <Error errorMessage={error.message} />

  const stats = data?.stats

  interface StatOrSkeletonProps {
    value?: number
  }

  const StatOrSkeleton: React.FC<StatOrSkeletonProps> = ({ value }) => {
    if (!value) {
      return (
        <Skeleton
          height="20px"
          width="50px"
          display="inline-block"
          mr="0.2em"
        />
      )
    }
    return <>{value}</>
  }

  const getStatString = (_asd: any) => 2

  const xRankMonthCount = xRankMonths()

  return (
    <>
      <Box fontSize="xl" fontWeight="hairline" mt="1em" color={grayWithShade}>
        {t("home;Featuring...")}
      </Box>
      <Flex
        flexDirection="column"
        alignItems="center"
        fontSize="xl"
        fontWeight="black"
        mt="0.5em"
        textAlign="center"
      >
        <Box mb="0.5em">
          <Trans i18nKey="home;xRankMonths">
            {{ xRankMonthCount }} months of{" "}
            <Link to="/xsearch">
              <Box as="span" color={themeColorWithShade}>
                X Rank Top 500 data
              </Box>
            </Link>
          </Trans>
        </Box>
        <Box mb="0.5em">
          <Trans i18nKey="home;buildCount">
            <StatOrSkeleton value={stats?.build_count} />{" "}
            <Link to="/builds">
              <Box as="span" color={themeColorWithShade}>
                builds
              </Box>
            </Link>
          </Trans>
        </Box>
        <Box mb="0.5em">
          <Trans i18nKey="home;userCount">
            <StatOrSkeleton value={stats?.user_count} />{" "}
            <Link to="/u">
              <Box as="span" color={themeColorWithShade}>
                users
              </Box>
            </Link>{" "}
          </Trans>
        </Box>
        <Box mb="0.5em">
          <Trans i18nKey="home;faCount">
            <StatOrSkeleton value={stats?.fa_count} />{" "}
            <Link to="/freeagents">
              <Box as="span" color={themeColorWithShade}>
                free agents
              </Box>
            </Link>
          </Trans>
        </Box>
        <Box>
          <Trans i18nKey="home;tournamentCount">
            <StatOrSkeleton value={stats?.tournament_count} />{" "}
            <Link to="/tournaments">
              <Box as="span" color={themeColorWithShade}>
                tournament results
              </Box>
            </Link>
          </Trans>
        </Box>
      </Flex>
      <Box fontSize="xl" fontWeight="hairline" mt="0.5em" color={grayWithShade}>
        {t("home;As well as")}
      </Box>
      <Flex
        flexDirection="column"
        alignItems="center"
        fontSize="xl"
        fontWeight="black"
        textAlign="center"
      >
        <Box mb="0.5em">
          <Trans i18nKey="home;calendarExplanation">
            <Link to="/calendar">
              <Box as="span" color={themeColorWithShade}>
                Calendar
              </Box>
            </Link>{" "}
            to discover upcoming events
          </Trans>
        </Box>
        <Box mb="0.5em">
          <Trans i18nKey="home;drawingToolExplanation">
            <Link to="/plans">
              <Box as="span" color={themeColorWithShade}>
                Map drawing tool
              </Box>
            </Link>{" "}
            to easily share your plans
          </Trans>
        </Box>
        <Box>
          <Trans i18nKey="home;analyzerExplanation">
            <Link to="/analyzer">
              <Box as="span" color={themeColorWithShade}>
                Build analyzer
              </Box>
            </Link>{" "}
            to find out exactly what your builds are doing
          </Trans>
        </Box>
      </Flex>
    </>
  )
}

export default Stats
