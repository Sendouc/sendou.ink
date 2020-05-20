import { useQuery } from "@apollo/react-hooks"
import { Box, Flex, Skeleton } from "@chakra-ui/core"
import { Link } from "@reach/router"
import React, { useContext } from "react"
import { STATS } from "../../graphql/queries/stats"
import MyThemeContext from "../../themeContext"
import Error from "../common/Error"

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

  if (error) return <Error errorMessage={error.message} />

  const stats = data?.stats

  const getStatString = (value?: number) => {
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
    return value
  }

  return (
    <>
      <Box fontSize="xl" fontWeight="hairline" mt="1em" color={grayWithShade}>
        Featuring...
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
          {xRankMonths()} months of{" "}
          <Link to="/xsearch">
            <Box as="span" color={themeColorWithShade}>
              X Rank Top 500 data
            </Box>
          </Link>
        </Box>
        <Box mb="0.5em">
          {getStatString(stats?.build_count)}{" "}
          <Link to="/builds">
            <Box as="span" color={themeColorWithShade}>
              builds
            </Box>
          </Link>
        </Box>
        <Box mb="0.5em">
          {getStatString(stats?.user_count)}{" "}
          <Link to="/u">
            <Box as="span" color={themeColorWithShade}>
              users
            </Box>
          </Link>{" "}
        </Box>
        <Box mb="0.5em">
          {getStatString(stats?.fa_count)}{" "}
          <Link to="/freeagents">
            <Box as="span" color={themeColorWithShade}>
              free agents
            </Box>
          </Link>
        </Box>
        <Box>
          {getStatString(stats?.tournament_count)}{" "}
          <Link to="/tournaments">
            <Box as="span" color={themeColorWithShade}>
              tournament results
            </Box>
          </Link>
        </Box>
      </Flex>
      <Box fontSize="xl" fontWeight="hairline" mt="0.5em" color={grayWithShade}>
        As well as
      </Box>
      <Flex
        flexDirection="column"
        alignItems="center"
        fontSize="xl"
        fontWeight="black"
        textAlign="center"
      >
        <Box mb="0.5em">
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
