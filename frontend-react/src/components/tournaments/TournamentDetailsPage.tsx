import React, { useContext } from "react"
import { RouteComponentProps, Redirect, Link } from "@reach/router"
import { useQuery } from "@apollo/react-hooks"
import {
  SEARCH_FOR_TOURNAMENT_BY_ID,
  SearchForTournamentByIdData,
  SearchForTournamentByIdVars,
} from "../../graphql/queries/searchForTournamentById"
import Error from "../common/Error"
import Loading from "../common/Loading"
import TournamentCard from "./TournamentCard"
import { Box, Flex, Avatar, Icon, Grid } from "@chakra-ui/core"
import Button from "../elements/Button"
import { Helmet } from "react-helmet-async"
import { FaLongArrowAltLeft } from "react-icons/fa"
import MyThemeContext from "../../themeContext"
import { mapIcons } from "../../assets/imageImports"
import WeaponImage from "../common/WeaponImage"
import AbilityIcon from "../builds/AbilityIcon"
import { Ability, Weapon } from "../../types"
import {
  useQueryParams,
  StringParam,
  ArrayParam,
  encodeQueryParams,
} from "use-query-params"
import { stringify } from "querystring"
import { removeFalsy } from "../../utils/helperFunctions"

interface TournamentDetailsPageProps {
  id?: string
}

interface Round {
  stage: string
  mode: "SZ" | "TC" | "RM" | "CB" | "TW"
  round_name: string
  round_number: number
  game_number: number
  winning_team_name: string
  winning_team_players: string[]
  winning_team_weapons: Weapon[]
  winning_team_main_abilities: Ability[][]
  losing_team_name: string
  losing_team_players: string[]
  losing_team_weapons: Weapon[]
  losing_team_main_abilities: Ability[][]
}

const filterMap = {
  team_name: StringParam,
  player_name: StringParam,
  comp: ArrayParam,
  mode: StringParam,
  stage: StringParam,
}

const TournamentDetailsPage: React.FC<RouteComponentProps &
  TournamentDetailsPageProps> = ({ id }) => {
  const {
    themeColorWithShade,
    grayWithShade,
    textColor,
    darkerBgColor,
  } = useContext(MyThemeContext)
  const { data, error, loading } = useQuery<
    SearchForTournamentByIdData,
    SearchForTournamentByIdVars
  >(SEARCH_FOR_TOURNAMENT_BY_ID, {
    variables: { id: id! },
    skip: !id,
  })
  const [filter] = useQueryParams(filterMap)

  if (!id) return <Redirect to="/404" />
  if (error) return <Error errorMessage={error.message} />
  if (loading) return <Loading />
  if (!data || !data.searchForTournamentById) return <Redirect to="/404" />

  const tournament = data.searchForTournamentById

  const abilityMap = (ability: Ability, index: number) => {
    const gridArea = `3 / ${1 + index} / 4 / ${2 + index}`
    return (
      <Box gridArea={gridArea} key={index}>
        <AbilityIcon ability={ability ? ability : "UNKNOWN"} size="TINY" />
      </Box>
    )
  }

  const matchesFilter = (round: Round) => {
    const { team_name, player_name, comp, mode, stage } = filter
    if (team_name) {
      const teamNameUpper = team_name.toUpperCase()
      if (
        round.winning_team_name.toUpperCase() === teamNameUpper ||
        round.losing_team_name.toUpperCase() === teamNameUpper
      ) {
        return true
      }
    }

    if (player_name) {
      const playerNameUpper = player_name.toUpperCase()
      if (
        round.winning_team_players.some(
          player => player.toUpperCase() === playerNameUpper
        ) ||
        round.losing_team_players.some(
          player => player.toUpperCase() === playerNameUpper
        )
      ) {
        return true
      }
    }

    if (comp) {
      if (
        comp.every(
          weapon => round.winning_team_weapons.indexOf(weapon as any) !== -1
        ) ||
        comp.every(
          weapon => round.losing_team_weapons.indexOf(weapon as any) !== -1
        )
      ) {
        return true
      }
    }

    if (mode && stage) {
      if (mode === round.mode && stage === round.stage) {
        return true
      }
    }

    return false
  }

  const encoded = encodeQueryParams(filterMap, removeFalsy(filter))
  const linkSuffix = `?${stringify(encoded)}`

  console.log("filter", filter)

  return (
    <>
      <Helmet>
        <title>{tournament.name} | sendou.ink</title>
      </Helmet>
      <Link
        to={
          linkSuffix.length === 1 ? "/tournaments" : `/tournaments${linkSuffix}`
        }
      >
        <Button outlined icon={FaLongArrowAltLeft}>
          All tournaments
        </Button>
      </Link>
      <Flex justifyContent="center" mt="1em">
        <Box maxWidth="300px">
          <TournamentCard tournament={tournament} />
        </Box>
      </Flex>
      {tournament.rounds.map(round => {
        return (
          <Box key={`${round.round_name}_${round.game_number}`} mt="1em">
            {round.game_number === 1 && (
              <Box
                borderBottomColor={themeColorWithShade}
                borderBottomWidth="2px"
                color={grayWithShade}
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="md"
                textAlign="center"
              >
                {round.round_name}
              </Box>
            )}
            <Box
              bg={matchesFilter(round) ? darkerBgColor : undefined}
              display="flex"
              rounded="lg"
              overflow="hidden"
              boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
              p="25px"
              flexDirection="column"
              justifyContent="space-between"
              alignItems="center"
            >
              <Flex
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="md"
                flexDirection="column"
                alignItems="center"
              >
                <Box color={themeColorWithShade}>{round.game_number}.</Box>
                <Avatar src={mapIcons[round.stage]} size="lg" my="5px" />
                {round.stage}
                <Icon
                  name={round.mode.toLowerCase() as any}
                  color={themeColorWithShade}
                  size="2em"
                />
              </Flex>
              <Flex mt="2em" flexDirection="column" alignItems="center">
                <Flex
                  flexDirection="column"
                  fontWeight="semibold"
                  letterSpacing="wide"
                  fontSize="md"
                  alignItems="center"
                >
                  <Box color={grayWithShade}>VICTORY</Box>
                  <Box color={textColor} fontSize="xl">
                    {round.winning_team_name}
                  </Box>
                </Flex>
                <Flex flexWrap="wrap" justifyContent="center">
                  {round.winning_team_players.map((player, index) => (
                    <Grid
                      key={player}
                      gridTemplateColumns="repeat(3, 1fr)"
                      gridTemplateRows="repeat(3, 1fr)"
                      gridColumnGap="5px"
                      gridRowGap="5px"
                      m="0.75em"
                    >
                      <Flex
                        gridArea="1 / 1 / 2 / 4"
                        alignItems="flex-end"
                        justifyContent="center"
                        letterSpacing="wide"
                        fontSize="md"
                      >
                        {player}
                      </Flex>
                      <Box gridArea="2 / 2 / 3 / 3" mb="0.4em">
                        <WeaponImage
                          englishName={round.winning_team_weapons[index]}
                          size="SMALL"
                        />
                      </Box>{" "}
                      {round.winning_team_main_abilities[index].map(abilityMap)}
                    </Grid>
                  ))}
                </Flex>
                <Flex mt="2em" flexDirection="column" alignItems="center">
                  <Flex
                    flexDirection="column"
                    fontWeight="semibold"
                    letterSpacing="wide"
                    fontSize="md"
                    alignItems="center"
                  >
                    <Box color={grayWithShade}>DEFEAT</Box>
                    <Box color={textColor} fontSize="xl">
                      {round.losing_team_name}
                    </Box>
                  </Flex>
                  <Flex flexWrap="wrap" justifyContent="center">
                    {round.losing_team_players.map((player, index) => (
                      <Grid
                        key={player}
                        gridTemplateColumns="repeat(3, 1fr)"
                        gridTemplateRows="repeat(3, 1fr)"
                        gridColumnGap="5px"
                        gridRowGap="5px"
                        m="0.75em"
                      >
                        <Flex
                          gridArea="1 / 1 / 2 / 4"
                          alignItems="flex-end"
                          justifyContent="center"
                          letterSpacing="wide"
                          fontSize="md"
                        >
                          {player}
                        </Flex>
                        <Box gridArea="2 / 2 / 3 / 3" mb="0.4em">
                          <WeaponImage
                            englishName={round.losing_team_weapons[index]}
                            size="SMALL"
                          />
                        </Box>{" "}
                        {round.losing_team_main_abilities[index].map(
                          abilityMap
                        )}
                      </Grid>
                    ))}
                  </Flex>
                </Flex>
              </Flex>
            </Box>
          </Box>
        )
      })}
    </>
  )
}

export default TournamentDetailsPage
