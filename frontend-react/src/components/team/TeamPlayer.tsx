import React, { useContext } from "react"
import UserAvatar from "../common/UserAvatar"
import { Box, Flex } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import WeaponImage from "../common/WeaponImage"
import { Weapon, CountryCode } from "../../types"
import Flag from "../common/Flag"

interface TeamPlayerProps {
  username: string
  avatar?: string
  weapons?: Weapon[]
  role?: string
  country?: CountryCode
}

const TeamPlayer: React.FC<TeamPlayerProps> = ({
  username,
  avatar,
  weapons,
  role,
  country,
}) => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext)
  return (
    <>
      <Flex>
        <Box
          border="2px solid"
          borderColor={themeColorWithShade}
          borderBottom={0}
          borderTopLeftRadius="125px"
          borderTopRightRadius="125px"
          width="125px"
          height="66px"
          pl="7px"
        >
          <UserAvatar
            name={username}
            src={avatar}
            size="xl"
            mt="5px"
            mr="7px"
          />
        </Box>
        <Flex
          borderBottom="2px solid white"
          w="100%"
          borderColor={themeColorWithShade}
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Box ml="0.5em" fontSize="1.7em" fontWeight="bold">
            {username} {country && <Flag code={country} size="32" />}
          </Box>
          {weapons && weapons.length > 0 && (
            <Flex mt="0.2rem">
              {weapons.map((wpn) => (
                <Box m="0.4em" key={wpn}>
                  <WeaponImage englishName={wpn} size="SMEDIUM" />
                </Box>
              ))}
            </Flex>
          )}
        </Flex>
      </Flex>
      <Box
        ml="129px"
        fontSize="1.4em"
        fontWeight="bold"
        textTransform="uppercase"
        mt="0.2em"
        opacity={0.4}
      >
        {role}
      </Box>
    </>
  )
}

export default TeamPlayer
