import React, { useContext, useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  SEARCH_FOR_DRAFT_CUP,
  SearchForDraftCupData,
  SearchForDraftCupVars,
} from "../../graphql/queries/searchForDraftCup"
import { useQuery } from "@apollo/react-hooks"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { DraftTournamentCard } from "./DraftTournamentCards"
import Button from "../elements/Button"
import { FaExternalLinkAlt, FaLongArrowAltLeft } from "react-icons/fa"
import { Box, Flex, Avatar, Icon, Grid } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import {
  DetailedTeamInfo,
  Ability,
  HeadGear,
  ClothingGear,
  ShoesGear,
} from "../../types"
import { mapIcons } from "../../assets/imageImports"
import WeaponImage from "../common/WeaponImage"
import AbilityIcon from "../builds/AbilityIcon"
import GearImage from "../builds/GearImage"
import SplatnetIcon from "../common/SplatnetIcon"
import { Helmet } from "react-helmet-async"

interface DraftCupDetailsProps {
  id?: string
}

interface DetailedMapCardProps {
  mapDetails: {
    stage: string
    mode: "TW" | "SZ" | "TC" | "RM" | "CB"
    duration: number
    winners: DetailedTeamInfo
    losers: DetailedTeamInfo
  }
  gameNumber: number
}

interface CollapsedMapCardProps {
  mapDetails: {
    stage: string
    mode: "TW" | "SZ" | "TC" | "RM" | "CB"
    duration: number
    winners: DetailedTeamInfo
    losers: DetailedTeamInfo
  }[]
  expand: () => void
}

const abilityMap = (ability: Ability, index: number) => {
  const gridArea = `5 / ${1 + index} / 6 / ${2 + index}`
  return (
    <Flex
      gridArea={gridArea}
      key={index}
      justifyContent="center"
      alignItems="flex-end"
    >
      <AbilityIcon ability={ability ? ability : "UNKNOWN"} size="TINY" />
    </Flex>
  )
}

const gearMap = (gear: HeadGear | ClothingGear | ShoesGear, index: number) => {
  const gridArea = `4 / ${1 + index} / 5 / ${2 + index}`
  return (
    <Flex gridArea={gridArea} key={index} justifyContent="center">
      <GearImage englishName={gear} mini />
    </Flex>
  )
}

const DetailedMapCard: React.FC<DetailedMapCardProps> = ({
  mapDetails,
  gameNumber,
}) => {
  const { themeColorWithShade, grayWithShade, textColor } = useContext(
    MyThemeContext
  )

  return (
    <Flex
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
        <Box color={themeColorWithShade}>{gameNumber}.</Box>
        <Avatar src={mapIcons[mapDetails.stage]} size="lg" my="5px" />
        {mapDetails.stage}
        <Icon
          name={mapDetails.mode.toLowerCase() as any}
          color={themeColorWithShade}
          size="2em"
        />
      </Flex>
      {[mapDetails.winners, mapDetails.losers].map((teamInfo, index) => {
        return (
          <Flex
            key={teamInfo.score}
            mt="2em"
            flexDirection="column"
            alignItems="center"
          >
            <Flex
              flexDirection="column"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="md"
              alignItems="center"
            >
              <Box color={grayWithShade} textAlign="center">
                {index === 0 ? "VICTORY" : "DEFEAT"}
              </Box>
              <Box color={themeColorWithShade}>
                {teamInfo.score === 100 ? "KO" : teamInfo.score}
              </Box>
              <Box color={textColor} fontSize="xl">
                {teamInfo.team_name}
              </Box>
            </Flex>
            <Flex flexWrap="wrap" justifyContent="center">
              {teamInfo.players.map((player, index) => (
                <Grid
                  key={`${player.discord_user.username}#${player.discord_user.discriminator}`}
                  gridTemplateColumns="repeat(3, 1fr)"
                  gridTemplateRows="1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
                  gridColumnGap="0.5em"
                  m="0.75em"
                >
                  <Flex
                    gridArea="1 / 1 / 2 / 4"
                    justifyContent="center"
                    alignItems="flex-end"
                    fontWeight={600}
                  >
                    <Link to={`/u/${player.discord_user.discord_id}`}>
                      {player.discord_user.username}
                    </Link>
                  </Flex>
                  <Flex
                    gridArea="2 / 1 / 3 / 4"
                    justifyContent="center"
                    fontSize="13px"
                    color={grayWithShade}
                    fontWeight={600}
                  >
                    {player.paint}p
                  </Flex>
                  <Flex gridArea="3 / 2 / 4 / 3" justifyContent="center">
                    <WeaponImage englishName={player.weapon} size="SMALL" />
                  </Flex>{" "}
                  {player.gear.map(gearMap)}
                  {player.main_abilities.map(abilityMap)}
                  <Flex gridArea="6 / 1 / 7 / 4" alignItems="center">
                    {player.sub_abilities.flat().map((ability, index) => (
                      <>
                        {(index === 3 || index === 6) && <Box w="5px" />}
                        <AbilityIcon
                          key={index}
                          ability={ability}
                          size="SUBTINY"
                        />
                      </>
                    ))}
                  </Flex>
                  <Flex gridArea="7 / 1 / 8 / 2" justifyContent="center">
                    <SplatnetIcon iconFor="kills" />
                  </Flex>
                  <Flex gridArea="7 / 2 / 8 / 3" justifyContent="center">
                    <SplatnetIcon iconFor="deaths" />
                  </Flex>
                  <Flex gridArea="7 / 3 / 8 / 4" justifyContent="center">
                    <SplatnetIcon iconFor={player.weapon} />
                  </Flex>
                  <Flex
                    gridArea="8 / 1 / 9 / 2"
                    justifyContent="center"
                    fontWeight="bold"
                  >
                    <Box color={grayWithShade}>x</Box>
                    <Box mx="3px">{player.kills + player.assists}</Box>
                    <Box fontSize="0.75em" mt="3px">
                      ({player.assists})
                    </Box>
                  </Flex>
                  <Flex
                    gridArea="8 / 2 / 9 / 3"
                    justifyContent="center"
                    fontWeight="bold"
                  >
                    <Box color={grayWithShade} mr="3px">
                      x
                    </Box>
                    <Box>{player.deaths}</Box>
                  </Flex>
                  <Flex
                    gridArea="8 / 3 / 9 / 4"
                    justifyContent="center"
                    alignItems="flex-start"
                    fontWeight="bold"
                  >
                    <Box color={grayWithShade} mr="3px">
                      x
                    </Box>
                    <Box>{player.specials}</Box>
                  </Flex>
                </Grid>
              ))}
            </Flex>
          </Flex>
        )
      })}
    </Flex>
  )
}

const CollapsedMapCard: React.FC<CollapsedMapCardProps> = ({
  expand,
  mapDetails,
}) => {
  const { grayWithShade } = useContext(MyThemeContext)
  const winnerTeamName = mapDetails[0].winners.team_name
  const loserTeamName = mapDetails[0].losers.team_name
  const winnerPlayers = mapDetails[0].winners.players
  const loserPlayers = mapDetails[0].losers.players
  const teamData = {
    [winnerTeamName]: { players: winnerPlayers, score: 0 },
    [loserTeamName]: { players: loserPlayers, score: 0 },
  }
  mapDetails.forEach(stage => {
    teamData[stage.winners.team_name].score =
      teamData[stage.winners.team_name].score + 1
  })

  const scores = Object.keys(teamData)
    .map(key => {
      return { players: teamData[key].players, score: teamData[key].score }
    })
    .sort((a, b) => b.score - a.score)

  return (
    <Flex
      rounded="lg"
      overflow="hidden"
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="25px"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
    >
      {scores.map(scoreObj => (
        <React.Fragment key={scoreObj.score}>
          <Flex flexWrap="wrap" fontWeight="bold" color={grayWithShade}>
            {scoreObj.players.map(player => (
              <Box
                key={`${player.discord_user.username}#${player.discord_user.discord_id}`}
                mx="0.5em"
              >
                {player.discord_user.username}
              </Box>
            ))}
          </Flex>
          <Box fontWeight="bolder" fontSize="1.25em" mb="1em">
            {scoreObj.score}
          </Box>
        </React.Fragment>
      ))}
      <Button onClick={() => expand()}>Expand</Button>
    </Flex>
  )
}

const DraftCupDetails: React.FC<RouteComponentProps & DraftCupDetailsProps> = ({
  id,
}) => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext)
  const idParts = id!.split("-")
  const { data, error, loading } = useQuery<
    SearchForDraftCupData,
    SearchForDraftCupVars
  >(SEARCH_FOR_DRAFT_CUP, { variables: { name: "+2 Draft Cup March 2020" } })
  const [expanded, setExpanded] = useState<number | null>(null)

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  const { tournament, matches } = data!.searchForDraftCup

  return (
    <>
      <Helmet>
        <title>{tournament.name} | sendou.ink</title>
      </Helmet>
      <Box mb="1em">
        <Link to="/plus/draft">
          <Button outlined icon={FaLongArrowAltLeft}>
            Back to Draft Cup home
          </Button>
        </Link>
      </Box>
      <DraftTournamentCard tournament={tournament} />
      <Box mt="1em">
        <a href={tournament.bracket_url}>
          <Button icon={FaExternalLinkAlt} outlined>
            Bracket
          </Button>
        </a>
      </Box>
      {matches.map(match => {
        return (
          <Box key={match.round_name} mt="1em">
            <Box
              borderBottomColor={themeColorWithShade}
              borderBottomWidth="2px"
              color={grayWithShade}
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="md"
              textAlign="center"
            >
              {match.round_name}
            </Box>

            {expanded === match.round_number ? (
              match.map_details.map((mapDetails, index) => (
                <DetailedMapCard
                  key={`${mapDetails.mode}${mapDetails.stage}`}
                  mapDetails={mapDetails}
                  gameNumber={index + 1}
                />
              ))
            ) : (
              <CollapsedMapCard
                expand={() => setExpanded(match.round_number)}
                mapDetails={match.map_details}
              />
            )}
          </Box>
        )
      })}
    </>
  )
}

export default DraftCupDetails
