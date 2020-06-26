import React from "react"
import { Flex, Box } from "@chakra-ui/core"
import { FaCrosshairs, FaBriefcaseMedical, FaAnchor } from "react-icons/fa"
import { useTranslation } from "react-i18next"

interface RoleIconsProps {
  playstyles: ("FRONTLINE" | "MIDLINE" | "BACKLINE")[]
}

const RoleIcons: React.FC<RoleIconsProps> = ({ playstyles }) => {
  const { t } = useTranslation()
  return (
    <Flex>
      <Box
        as={FaCrosshairs}
        w="30px"
        h="auto"
        color={playstyles.indexOf("FRONTLINE") === -1 ? "grey" : "green.500"}
        title={t("freeagents;Frontline/Slayer")}
        cursor="help"
      />
      <Box
        as={FaBriefcaseMedical}
        w="30px"
        h="auto"
        color={playstyles.indexOf("MIDLINE") === -1 ? "grey" : "green.500"}
        title={t("freeagents;Midline/Support")}
        mx="10px"
        cursor="help"
      />
      <Box
        as={FaAnchor}
        w="30px"
        h="auto"
        color={playstyles.indexOf("BACKLINE") === -1 ? "grey" : "green.500"}
        title={t("freeagents;Backline/Anchor")}
        cursor="help"
      />
    </Flex>
  )
}

export default RoleIcons
