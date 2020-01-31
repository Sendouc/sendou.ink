import React from "react"
import { Flex, Box } from "@chakra-ui/core"
import { FaCrosshairs, FaBriefcaseMedical, FaAnchor } from "react-icons/fa"

interface RoleIconsProps {
  playstyles: ("FRONTLINE" | "MIDLINE" | "BACKLINE")[]
}

const RoleIcons: React.FC<RoleIconsProps> = ({ playstyles }) => {
  return (
    <Flex>
      <Box
        as={FaCrosshairs}
        w="30px"
        h="auto"
        color={playstyles.indexOf("FRONTLINE") === -1 ? "grey" : "green.500"}
        title="Frontline/Slayer"
        cursor="help"
      />
      <Box
        as={FaBriefcaseMedical}
        w="30px"
        h="auto"
        color={playstyles.indexOf("MIDLINE") === -1 ? "grey" : "green.500"}
        title="Midline/Support"
        mx="10px"
        cursor="help"
      />
      <Box
        as={FaAnchor}
        w="30px"
        h="auto"
        color={playstyles.indexOf("BACKLINE") === -1 ? "grey" : "green.500"}
        title="Backline/Anchor"
        cursor="help"
      />
    </Flex>
  )
}

export default RoleIcons
