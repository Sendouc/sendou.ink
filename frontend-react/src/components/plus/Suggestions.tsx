import React, { useContext, useState } from "react"
import { useQuery } from "@apollo/react-hooks"
import { SUGGESTIONS } from "../../graphql/queries/suggestions"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { VOUCHES } from "../../graphql/queries/vouches"
import UserAvatar from "../common/UserAvatar"
import { UserLean } from "../../types"
import {
  Heading,
  Grid,
  Box,
  Flex,
  Popover,
  PopoverTrigger,
  IconButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/core"
import { Link } from "@reach/router"
import MyThemeContext from "../../themeContext"
import { IoIosChatbubbles } from "react-icons/io"
import Button from "../elements/Button"
import SuggestionVouchModal from "./SuggestionVouchModal"
import useBreakPoints from "../../hooks/useBreakPoints"

interface SuggestionsProps {
  user: UserLean
}

interface Suggestion {
  discord_user: {
    discord_id: string
    username: string
    discriminator: string
    avatar?: string
  }
  suggester_discord_user: {
    discord_id: string
    username: string
    discriminator: string
  }
  plus_server: "ONE" | "TWO"
  plus_region: "NA" | "EU"
  description: string
  createdAt: string
}

interface SuggestionsData {
  suggestions: Suggestion[]
}

interface VouchUser {
  username: string
  discriminator: string
  avatar?: string
  discord_id: string
  plus: {
    voucher_user: {
      username: string
      discriminator: string
      discord_id: string
    }
    vouch_status: string
  }
}

interface VouchesData {
  vouches: VouchUser[]
}

const Suggestions: React.FC<SuggestionsProps> = ({ user }) => {
  const { grayWithShade, themeColor, darkerBgColor } = useContext(
    MyThemeContext
  )
  const [showSuggestionForm, setShowSuggestionForm] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)
  const { data, error, loading } = useQuery<SuggestionsData>(SUGGESTIONS)
  const {
    data: vouchesData,
    error: vouchesError,
    loading: vouchesLoading,
  } = useQuery<VouchesData>(VOUCHES)
  const isSmall = useBreakPoints(570)

  if (error) return <Error errorMessage={error.message} />
  if (vouchesError) return <Error errorMessage={vouchesError.message} />
  if (loading || vouchesLoading || !data || !vouchesData) return <Loading />
  if (!data.suggestions || !user.plus) return null

  const ownSuggestion = data.suggestions.find(
    (suggestion) =>
      suggestion.suggester_discord_user.discord_id === user.discord_id
  )

  const canSuggest = !ownSuggestion

  const canVouch = Boolean(
    user.plus.can_vouch && !user.plus.can_vouch_again_after
  )

  const getButtonText = () => {
    if (canSuggest && canVouch) return "Suggest or vouch a player"
    else if (canSuggest) return "Suggest a player"
    else if (canVouch) return "Vouch a player"
  }

  const plusOneVouches = vouchesData.vouches.filter(
    (vouch) => vouch.plus.vouch_status === "ONE"
  )
  const plusTwoVouches = vouchesData.vouches.filter(
    (vouch) => vouch.plus.vouch_status === "TWO"
  )

  const plusOneSuggested = data.suggestions.filter(
    (suggestion) => suggestion.plus_server === "ONE"
  )
  const plusTwoSuggested = data.suggestions.filter(
    (suggestion) => suggestion.plus_server === "TWO"
  )

  const vouchMap = (vouch: VouchUser) => {
    return (
      <React.Fragment key={vouch.discord_id}>
        <Flex mr="1em" alignItems="center">
          <UserAvatar src={vouch.avatar} name={vouch.username} size="sm" />
        </Flex>
        <Box>
          <Box as="span" fontWeight="bold">
            <Link to={`/u/${vouch.discord_id}`}>
              {vouch.username}#{vouch.discriminator}
            </Link>
          </Box>{" "}
          <Box color={grayWithShade}>
            by {vouch.plus.voucher_user.username}#
            {vouch.plus.voucher_user.discriminator}
          </Box>
        </Box>
      </React.Fragment>
    )
  }

  const suggestionMap = (suggestion: Suggestion) => {
    const suggested_user = suggestion.discord_user
    const suggester_user = suggestion.suggester_discord_user
    return (
      <React.Fragment key={suggestion.discord_user.discord_id}>
        <Flex mr="1em" alignItems="center">
          <UserAvatar
            src={suggested_user.avatar}
            name={suggested_user.username}
            size="sm"
          />
        </Flex>
        <Flex flexDirection="column" justifyContent="center">
          <Box as="span" fontWeight="bold">
            <Link to={`/u/${suggested_user.discord_id}`}>
              {suggested_user.username}#{suggested_user.discriminator}
            </Link>
          </Box>{" "}
          <Flex color={grayWithShade} alignItems="center">
            by {suggester_user.username}#{suggester_user.discriminator}
            <Popover placement="top">
              <PopoverTrigger>
                <IconButton
                  variant="ghost"
                  isRound
                  variantColor={themeColor}
                  aria-label="Show description"
                  fontSize="20px"
                  icon={IoIosChatbubbles}
                />
              </PopoverTrigger>
              <PopoverContent
                zIndex={4}
                width="220px"
                backgroundColor={darkerBgColor}
              >
                <PopoverArrow />
                <PopoverBody textAlign="center" whiteSpace="pre-wrap">
                  {suggestion.description}
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Flex>
        </Flex>
      </React.Fragment>
    )
  }

  const buttonText = getButtonText()

  return (
    <>
      {showSuggestionForm && (
        <SuggestionVouchModal
          closeModal={() => setShowSuggestionForm(false)}
          canSuggest={canSuggest}
          canVouch={canVouch}
          plusServer={user.plus.membership_status!}
        />
      )}

      <Box mt="1em">
        {buttonText && (
          <Button onClick={() => setShowSuggestionForm(true)}>
            {buttonText}
          </Button>
        )}
        {!isSmall ? (
          <Tabs
            index={tabIndex}
            onChange={(chosenIndex) => setTabIndex(chosenIndex)}
            isFitted
            variant="line"
            mt="2em"
            variantColor={themeColor}
          >
            <TabList>
              {user.plus.membership_status === "ONE" && (
                <Tab>
                  Vouches to +1{" "}
                  <Badge variantColor={themeColor} ml="0.5em">
                    {plusOneVouches.length}
                  </Badge>
                </Tab>
              )}
              <Tab>
                Vouches to +2{" "}
                <Badge variantColor={themeColor} ml="0.5em">
                  {plusTwoVouches.length}
                </Badge>
              </Tab>
              {user.plus.membership_status === "ONE" && (
                <Tab>
                  Suggestions to +1{" "}
                  <Badge variantColor={themeColor} ml="0.5em">
                    {plusOneSuggested.length}
                  </Badge>
                </Tab>
              )}
              <Tab>
                Suggestions to +2{" "}
                <Badge variantColor={themeColor} ml="0.5em">
                  {plusTwoSuggested.length}
                </Badge>
              </Tab>
            </TabList>
            <TabPanels mb="1em">
              {user.plus.membership_status === "ONE" && (
                <TabPanel>
                  <Box mt="1em">
                    <Grid
                      gridRowGap="0.5em"
                      gridTemplateColumns="min-content 1fr"
                      mt="1em"
                    >
                      {plusOneVouches.map(vouchMap)}
                    </Grid>
                  </Box>
                </TabPanel>
              )}
              <TabPanel>
                <Box mt="1em">
                  <Grid
                    gridRowGap="0.5em"
                    gridTemplateColumns="min-content 1fr"
                    mt="1em"
                  >
                    {plusTwoVouches.map(vouchMap)}
                  </Grid>
                </Box>
              </TabPanel>
              {user.plus.membership_status === "ONE" && (
                <TabPanel>
                  <Box mt="1em">
                    <Grid
                      gridRowGap="0.5em"
                      gridTemplateColumns="min-content 1fr"
                      mt="1em"
                    >
                      {plusOneSuggested.map(suggestionMap)}
                    </Grid>
                  </Box>
                </TabPanel>
              )}
              <TabPanel>
                <Box mt="1em">
                  <Grid
                    gridRowGap="0.5em"
                    gridTemplateColumns="min-content 1fr"
                    mt="1em"
                  >
                    {plusTwoSuggested.map(suggestionMap)}
                  </Grid>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <>
            {user.plus.membership_status === "ONE" && (
              <Box mt="1em">
                <Heading>Vouched to +1</Heading>
                <Grid
                  gridRowGap="0.5em"
                  gridTemplateColumns="min-content 1fr"
                  mt="1em"
                >
                  {plusOneVouches.map(vouchMap)}
                </Grid>
              </Box>
            )}
            <Box mt="1em">
              <Heading>Vouched to +2</Heading>
              <Grid
                gridRowGap="0.5em"
                gridTemplateColumns="min-content 1fr"
                mt="1em"
              >
                {plusTwoVouches.map(vouchMap)}
              </Grid>
            </Box>
            {user.plus.membership_status === "ONE" && (
              <Box mt="1em">
                <Heading>Suggested to +1</Heading>
                <Grid
                  gridRowGap="0.5em"
                  gridTemplateColumns="min-content 1fr"
                  mt="1em"
                >
                  {plusOneSuggested.map(suggestionMap)}
                </Grid>
              </Box>
            )}
            <Box mt="1em">
              <Heading>Suggested to +2</Heading>
              <Grid
                gridRowGap="0.5em"
                gridTemplateColumns="min-content 1fr"
                mt="1em"
              >
                {plusTwoSuggested.map(suggestionMap)}
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </>
  )
}

export default Suggestions
