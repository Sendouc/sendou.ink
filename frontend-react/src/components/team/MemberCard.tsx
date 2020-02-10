import React from "react"
import { Weapon, CountryCode } from "../../types"
import Box from "../elements/Box"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import { Link } from "@reach/router"
import UserAvatar from "../common/UserAvatar"
import WeaponImage from "../common/WeaponImage"
import Flag from "../common/Flag"
import { countries } from "../../utils/lists"

interface MemberCardProps {
  member: {
    discord_id: string
    username: string
    discriminator: string
    twitch_name?: string
    twitter_name?: string
    country?: CountryCode
    weapons: Weapon[]
    custom_url?: string
  }
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const { borderStyle, grayWithShade } = useContext(MyThemeContext)
  return (
    <Box
      as="fieldset"
      display="block"
      borderWidth="1px"
      border={borderStyle}
      //w="300px"
      rounded="lg"
      overflow="hidden"
      //pb={showUser && build.discord_user ? "20px" : "15px"}
      p="15px"
      w="240px"
      h="180px"
    >
      <Box
        as="legend"
        color={grayWithShade}
        fontWeight="semibold"
        letterSpacing="wide"
        fontSize="s"
      >
        <Link to={`/u/${member.custom_url ?? member.discord_id}`}>
          {member.username}#{member.discriminator}
        </Link>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center">
        <UserAvatar name={member.username} twitterName={member.twitter_name} />
        {member.country && (
          <Box mt="0.5em" display="flex" alignItems="center">
            <Flag code={member.country} />
            {countries.find(obj => obj.code === member.country)?.name}
          </Box>
        )}
        <Box display="flex" mt="0.5em">
          {member.weapons.map(wpn => (
            <Box mx="0.3em" key={wpn}>
              <WeaponImage englishName={wpn} size="SMALL" />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default MemberCard
