import React, { useContext } from "react"
import { useQuery } from "@apollo/react-hooks"
import { STATS } from "../../graphql/queries/stats"
import Error from "../common/Error"
import Loading from "../common/Loading"
import Box from "../elements/Box"
import { Flex } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import { Link } from "@reach/router"

interface StatsData {
  stats: {
    build_count: number
    tournament_count: number
    fa_count: number
    user_count: number
  }
}

const getStatString = (value: number) => {
  if (value < 100) return value

  const evenNumber = Math.floor(value / 100) * 100

  return `Over ${evenNumber}`
}

const xRankMonths = () => {
  const date = new Date()
  const fullYears = date.getFullYear() - 2019
  return 8 + fullYears * 12 + date.getMonth()
}

const Stats: React.FC = () => {
  const { grayWithShade, themeColorWithShade } = useContext(MyThemeContext)
  const { data, error, loading } = useQuery<StatsData>(STATS)

  if (error) return <Error errorMessage={error.message} />
  if (loading || !data) return <Loading />

  const { stats } = data
  return (
    <>
      <Box fontSize="2xl" fontWeight="hairline" mt="2em" color={grayWithShade}>
        Featuring...
      </Box>
      <Flex
        flexDirection="column"
        alignItems="center"
        fontSize="2xl"
        fontWeight="black"
        mt="0.5em"
        textAlign="center"
      >
        <Box>
          {xRankMonths()} months of{" "}
          <Link to="/xsearch">
            <Box as="span" color={themeColorWithShade}>
              X Rank Top 500 data
            </Box>
          </Link>
        </Box>
        <Box>
          {getStatString(stats.build_count)}{" "}
          <Link to="/builds">
            <Box as="span" color={themeColorWithShade}>
              builds
            </Box>
          </Link>
        </Box>
        <Box>{getStatString(stats.user_count)} users</Box>
        <Box>
          {getStatString(stats.fa_count)}{" "}
          <Link to="/freeagents">
            <Box as="span" color={themeColorWithShade}>
              free agents
            </Box>
          </Link>
        </Box>
        <Box>
          {getStatString(stats.tournament_count)}{" "}
          <Link to="/tournaments">
            <Box as="span" color={themeColorWithShade}>
              tournaments' data
            </Box>
          </Link>
        </Box>
      </Flex>
      <Box fontSize="2xl" fontWeight="hairline" mt="1em" color={grayWithShade}>
        As well as
      </Box>
      <Flex
        flexDirection="column"
        alignItems="center"
        fontSize="2xl"
        fontWeight="black"
        mt="0.5em"
        textAlign="center"
      >
        <Box>
          <Link to="/calendar">
            <Box as="span" color={themeColorWithShade}>
              Calendar
            </Box>
          </Link>{" "}
          to discover upcoming events
        </Box>
        <Box>
          <Link to="/plans">
            <Box as="span" color={themeColorWithShade}>
              Map drawing tool
            </Box>
          </Link>{" "}
          to easily share your plans
        </Box>
      </Flex>
    </>
  )
}

export default Stats
