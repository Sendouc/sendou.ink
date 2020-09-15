import { Box, Flex, Image } from "@chakra-ui/core"
import React, { useContext } from "react"
import { useTranslation } from "react-i18next"
import trophy from "../../assets/trophy.png"
import MyThemeContext from "../../themeContext"
import { Weapon } from "../../types"
import Flag from "../common/Flag"
import Section from "../common/Section"
import WeaponImage from "../common/WeaponImage"

interface TournamentCardProps {
  tournament: {
    id: string
    name: string
    jpn: boolean
    google_sheet_url?: string
    bracket?: string
    date: string
    popular_weapons: string[]
    winning_team_name: string
    winning_team_players: string[]
  }
  styledOnHover?: boolean
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  styledOnHover,
}) => {
  const { t, i18n } = useTranslation()
  const { grayWithShade } = useContext(MyThemeContext)
  const dateStr = new Date(parseInt(tournament.date)).toLocaleDateString(
    i18n.language
  )
  return (
    <Section
      display="flex"
      rounded="lg"
      overflow="hidden"
      w="100%"
      h="100%"
      flexDirection="column"
      justifyContent="space-between"
      transition="all 0.2s"
      _hover={styledOnHover ? { transform: "translateY(-3px)" } : undefined}
    >
      <Box fontWeight="semibold" as="h4" lineHeight="tight">
        {tournament.name}
      </Box>
      <Box
        color={grayWithShade}
        fontWeight="semibold"
        letterSpacing="wide"
        fontSize="xs"
        mt="0.5em"
      >
        {dateStr} {tournament.jpn && <Flag code="jp" />}
      </Box>
      <Flex
        alignItems="center"
        mt="1.5em"
        fontWeight="semibold"
        as="h4"
        lineHeight="tight"
      >
        <Image w="30px" h="auto" src={trophy} mr="0.5em" />{" "}
        {tournament.winning_team_name}
      </Flex>
      <Box color={grayWithShade} letterSpacing="wide" fontSize="sm" mt="0.5em">
        {tournament.winning_team_players.join(", ")}
      </Box>
      <Box>
        <Box
          color={grayWithShade}
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="xs"
          mt="1.5em"
        >
          {t("tournaments;Popular weapons")}
        </Box>
        <Flex flexWrap="wrap">
          {tournament.popular_weapons.map((weapon) => (
            <Box key={weapon} mx="0.2em">
              <WeaponImage englishName={weapon as Weapon} size="SMALL" />
            </Box>
          ))}
        </Flex>
      </Box>
    </Section>
  )
}

export default TournamentCard
