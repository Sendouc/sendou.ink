import React, { useContext } from "react"
import UserAvatar from "../common/UserAvatar"
import { Summary } from "./VotingHistoryPage"
import {
  Heading,
  Box,
  Grid,
  Flex,
  Popover,
  PopoverTrigger,
  IconButton,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from "@chakra-ui/core"
import { Link } from "@reach/router"
import MyThemeContext from "../../themeContext"
import { FaBolt } from "react-icons/fa"

const getColor = (score: number) =>
  score < 50 ? { color: "red" } : { color: "green" }

interface CountProps {
  count: number[]
}

const Count: React.FC<CountProps> = ({ count }) => {
  const { colorMode } = useContext(MyThemeContext)
  const printOuter = count[0] !== 0 || count[3] !== 0
  const shade = colorMode === "light" ? "600" : "400"
  return (
    <Box as="span" fontSize="18px">
      {printOuter && (
        <>
          <Box as="span" color={`red.${shade}`}>
            {count[0]}
          </Box>
          /
        </>
      )}
      <Box as="span" color={`red.${shade}`}>
        {count[1]}
      </Box>
      /
      <Box as="span" color={`green.${shade}`}>
        {count[2]}
      </Box>
      {printOuter && (
        <>
          /
          <Box as="span" color={`green.${shade}`}>
            {count[3]}
          </Box>
        </>
      )}
    </Box>
  )
}

interface SummariesProps {
  summaries: Summary[]
}

const Summaries: React.FC<SummariesProps> = ({ summaries }) => {
  const { grayWithShade, themeColor, darkerBgColor } = useContext(
    MyThemeContext
  )
  const members: Summary[] = []
  const suggested: Summary[] = []

  summaries.forEach((summary) => {
    if (summary.suggested) suggested.push(summary)
    else members.push(summary)
  })

  const summaryMap = (summary: Summary) => {
    const { discord_user, score } = summary
    return (
      <React.Fragment key={discord_user.discord_id}>
        <Flex mr="1em" alignItems="center">
          <UserAvatar
            src={discord_user.avatar}
            name={discord_user.username}
            size="sm"
          />
        </Flex>
        <Box>
          <Box as="span" fontWeight="bold">
            <Link to={`/u/${discord_user.discord_id}`}>
              {discord_user.username}#{discord_user.discriminator}
            </Link>
          </Box>{" "}
          <Box color={grayWithShade}>
            <b>
              <span style={{ fontSize: "20px", ...getColor(score.total) }}>
                {score.total}%
              </span>
            </b>{" "}
            {score.eu_count && score.na_count && score.eu_count.length > 0 && (
              <>
                (EU <Count count={score.eu_count} /> | NA{" "}
                <Count count={score.na_count} />)
              </>
            )}
            {summary.vouched && (
              <Popover placement="top">
                <PopoverTrigger>
                  <IconButton
                    variant="ghost"
                    isRound
                    variantColor={themeColor}
                    aria-label="Show description"
                    fontSize="20px"
                    icon={FaBolt}
                  />
                </PopoverTrigger>
                <PopoverContent
                  zIndex={4}
                  width="220px"
                  backgroundColor={darkerBgColor}
                >
                  <PopoverArrow />
                  <PopoverBody textAlign="center">
                    User was voted to the server this month
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            )}
          </Box>
        </Box>
      </React.Fragment>
    )
  }

  return (
    <>
      <Grid gridRowGap="0.5em" gridTemplateColumns="min-content 1fr" mt="1em">
        {members.map(summaryMap)}
      </Grid>
      <Heading size="md" mt="1em">
        Suggested
      </Heading>
      <Grid gridRowGap="0.5em" gridTemplateColumns="min-content 1fr" mt="1em">
        {suggested.map(summaryMap)}
      </Grid>
    </>
  )
}

export default Summaries
