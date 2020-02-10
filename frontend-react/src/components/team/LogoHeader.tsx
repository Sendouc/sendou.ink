import React from "react"
import UserAvatar from "../common/UserAvatar"
import Box from "../elements/Box"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"

interface LogoHeaderProps {
  name: string
  twitter_name?: string
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ name, twitter_name }) => {
  const { themeColorWithShade } = useContext(MyThemeContext)
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <UserAvatar name={name} twitterName={twitter_name} size="2xl" />
      <Box
        fontFamily="'Pacifico', cursive"
        fontWeight="light"
        fontSize="48px"
        borderBottomColor={themeColorWithShade}
        borderBottomWidth="5px"
        w="100%"
        textAlign="center"
      >
        {name}
      </Box>
    </Box>
  )
}

export default LogoHeader
