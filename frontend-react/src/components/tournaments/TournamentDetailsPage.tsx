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
import { Box, Flex, Image, Avatar, Icon, Grid } from "@chakra-ui/core"
import Button from "../elements/Button"
import { Helmet } from "react-helmet-async"
import { FaLongArrowAltLeft } from "react-icons/fa"
import MyThemeContext from "../../themeContext"
import { mapIcons } from "../../assets/imageImports"
import WeaponImage from "../common/WeaponImage"
import AbilityIcon from "../builds/AbilityIcon"
import { Ability } from "../../types"

interface TournamentDetailsPageProps {
  id?: string
}

const TournamentDetailsPage: React.FC<RouteComponentProps &
  TournamentDetailsPageProps> = ({ id }) => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext)
  const { data, error, loading } = useQuery<
    SearchForTournamentByIdData,
    SearchForTournamentByIdVars
  >(SEARCH_FOR_TOURNAMENT_BY_ID, {
    variables: { id: id! },
    skip: !id,
  })

  if (!id) return <Redirect to="/404" />
  if (error) return <Error errorMessage={error.message} />
  if (loading) return <Loading />
  if (!data || !data.searchForTournamentById) return <Redirect to="/404" />

  const tournament = data.searchForTournamentById
  console.log({ tournament })

  const abilityMap = (ability: Ability, index: number) => {
    const gridArea = `3 / ${1 + index} / 4 / ${2 + index}`
    return (
      <Box gridArea={gridArea} key={index}>
        <AbilityIcon ability={ability ? ability : "UNKNOWN"} size="TINY" />
      </Box>
    )
  }

  return (
    <>
      <Helmet>
        <title>{tournament.name} | sendou.ink</title>
      </Helmet>
      <Link to="/tournaments">
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
                  name={"sz" as any}
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
                  <Box color="white" fontSize="xl">
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
                    <Box color="white" fontSize="xl">
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
