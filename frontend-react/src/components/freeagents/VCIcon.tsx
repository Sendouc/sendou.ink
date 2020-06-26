import React from "react"
import { Box } from "@chakra-ui/core"
import { FaMicrophone } from "react-icons/fa"
import { useTranslation } from "react-i18next"

interface VCIconProps {
  canVC: "YES" | "USUALLY" | "SOMETIMES" | "NO"
}

const color = {
  YES: "green.500",
  USUALLY: "yellow.500",
  SOMETIMES: "yellow.500",
  NO: "red.500",
}

const title = {
  YES: "Can VC",
  USUALLY: "Can VC usually",
  SOMETIMES: "Can VC sometimes",
  NO: "Can't VC",
}

const VCIcon: React.FC<VCIconProps> = ({ canVC }) => {
  const { t } = useTranslation()
  return (
    <Box
      as={FaMicrophone}
      title={t(`freeagents;${title[canVC]}`)}
      color={color[canVC]}
      w="30px"
      h="auto"
      cursor="help"
    />
  )
}

export default VCIcon
