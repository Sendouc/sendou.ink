import React from "react"
import { Avatar, Flex, Box } from "@chakra-ui/core"

interface LogoHeaderProps {
  name: string
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ name }) => {
  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      <Avatar
        src="https://abload.de/img/scoze-logo-normalk9k93.png"
        size="2xl"
        name={name}
      />
      <Box fontSize="2em" fontWeight="bold" mt="0.5em">
        {name}
      </Box>
      <Box opacity={0.4}>Est. April 2020</Box>
    </Flex>
  )
}

export default LogoHeader
