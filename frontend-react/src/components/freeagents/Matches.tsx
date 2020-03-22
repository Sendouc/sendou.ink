import React, { useContext } from "react"
import FieldsetWithLegend from "../common/FieldsetWithLegend"
import {
  Flex,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@chakra-ui/core"
import UserAvatar from "../common/UserAvatar"
import MyThemeContext from "../../themeContext"

interface MatchesProps {
  matches: {
    username: string
    discriminator: string
    twitter_name?: string
  }[]
  likesReceived: number
}

const Matches: React.FC<MatchesProps> = ({ matches, likesReceived }) => {
  const { grayWithShade, themeColorWithShade, darkerBgColor } = useContext(
    MyThemeContext
  )

  if (matches.length === 0 && likesReceived === 0) return null

  const unrequitedLove = likesReceived - matches.length

  const getText1 = () => {
    if (unrequitedLove > 1 && matches.length > 0) return "Also there are "
    if (unrequitedLove > 1 && matches.length === 0) return "There are "
    if (unrequitedLove === 1 && matches.length > 0) return "Also there is "
    return "There is "
  }

  const text1 = getText1()
  const text2 =
    unrequitedLove > 1 ? (
      <>{unrequitedLove} free agents</>
    ) : (
      <>{unrequitedLove} free agent</>
    )
  const text3 =
    unrequitedLove > 1 ? (
      <>that liked you but you didn't like any of them back yet!</>
    ) : (
      <>that liked you but you didn't like them back yet!</>
    )

  return (
    <Flex justifyContent="center">
      <FieldsetWithLegend title="MATCHES" titleFontSize="xs">
        {matches.length > 0 ? (
          <>
            <Flex justifyContent="center" flexWrap="wrap">
              {matches.map(match => (
                <Box key={`${match.username}${match.discriminator}`} p="0.5em">
                  <Popover trigger="hover">
                    <PopoverTrigger>
                      <Box>
                        <UserAvatar
                          twitterName={match.twitter_name}
                          name={match.username}
                        />
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent zIndex={4} p="0.5em" bg={darkerBgColor}>
                      <PopoverArrow />
                      <Box>
                        You have a match with{" "}
                        <b>
                          {match.username}#{match.discriminator}
                        </b>
                        ! Contact them to see if you can get a team going
                      </Box>
                    </PopoverContent>
                  </Popover>
                </Box>
              ))}
            </Flex>
            {unrequitedLove > 0 && (
              <Box
                color={grayWithShade}
                mt="1em"
                fontWeight="bold"
                textAlign="center"
              >
                {text1}
                <Box as="span" color={themeColorWithShade}>
                  {text2}
                </Box>{" "}
                {text3}
              </Box>
            )}
          </>
        ) : (
          unrequitedLove > 0 && (
            <Box color={grayWithShade} fontWeight="bold" textAlign="center">
              {text1}
              <Box as="span" color={themeColorWithShade}>
                {text2}
              </Box>{" "}
              {text3}
            </Box>
          )
        )}
      </FieldsetWithLegend>
    </Flex>
  )
}

export default Matches
