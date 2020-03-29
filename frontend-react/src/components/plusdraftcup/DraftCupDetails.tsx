import React, { useContext } from "react"
import { RouteComponentProps } from "@reach/router"
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
import { FaExternalLinkAlt } from "react-icons/fa"
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

const abilityMap = (ability: Ability, index: number) => {
  const gridArea = `5 / ${1 + index} / 6 / ${2 + index}`
  return (
    <Flex gridArea={gridArea} key={index} justifyContent="center">
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
    <>
      <SplatnetIcon />
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
                    gridTemplateRows="repeat(5, 1fr)"
                    //gridRowGap="0.5em"
                    gridColumnGap="0.5em"
                    m="0.75em"
                  >
                    <Flex
                      gridArea="1 / 1 / 2 / 4"
                      justifyContent="center"
                      alignItems="flex-end"
                      fontWeight={600}
                    >
                      {player.discord_user.username}
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
                      {player.sub_abilities.flat().map(ability => (
                        <AbilityIcon ability={ability} size="SUBTINY" />
                      ))}
                    </Flex>
                  </Grid>
                ))}
              </Flex>
            </Flex>
          )
        })}
      </Box>
    </>
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

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  const { tournament, matches } = data!.searchForDraftCup

  return (
    <>
      <DraftTournamentCard tournament={tournament} />
      <Box mt="1em">
        <a href={tournament.bracket_url}>
          <Button icon={FaExternalLinkAlt} outlined>
            Bracket
          </Button>
        </a>
      </Box>
      {[matches[0]].map(match => {
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

            {match.map_details.map((mapDetails, index) => (
              <DetailedMapCard
                key={`${mapDetails.mode}${mapDetails.stage}`}
                mapDetails={mapDetails}
                gameNumber={index + 1}
              />
            ))}
          </Box>
        )
      })}
    </>
  )
}

export default DraftCupDetails
