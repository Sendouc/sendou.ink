import React from "react"
import { Flex, Box, Image } from "@chakra-ui/core"
import sz from "../../assets/sz.png"
import tc from "../../assets/tc.png"
import rm from "../../assets/rm.png"
import cb from "../../assets/cb.png"
import { useTranslation } from "react-i18next"

interface ModeButtonsProps {
  mode: "SZ" | "TC" | "RM" | "CB"
  setMode: (mode: "SZ" | "TC" | "RM" | "CB") => void
}

const iconSize = "45px"

const ModeButtons: React.FC<ModeButtonsProps> = ({ mode, setMode }) => {
  const { t } = useTranslation()
  return (
    <Flex>
      <Flex
        flexDir="column"
        p="10px"
        style={{ filter: mode === "SZ" ? undefined : "grayscale(100%)" }}
        cursor="pointer"
        onClick={() => setMode("SZ")}
        alignItems="center"
      >
        <Box
          _hover={{ transform: mode === "SZ" ? undefined : "scale(1.2)" }}
          transition="all 0.2s"
        >
          <Image
            src={sz}
            display="inline-block"
            w={iconSize}
            h={iconSize}
            title={t("game;Splat Zones")}
          />
        </Box>
        {mode === "SZ" && (
          <Box fontSize="1.25em" fontWeight="bold">
            {t("plans;splatZonesShort")}
          </Box>
        )}
      </Flex>
      <Flex
        flexDir="column"
        p="10px"
        style={{ filter: mode === "TC" ? undefined : "grayscale(100%)" }}
        cursor="pointer"
        onClick={() => setMode("TC")}
        alignItems="center"
      >
        <Box
          _hover={{ transform: mode === "TC" ? undefined : "scale(1.2)" }}
          transition="all 0.2s"
        >
          <Image
            src={tc}
            display="inline-block"
            w={iconSize}
            h={iconSize}
            title={t("game;Tower Control")}
          />
        </Box>
        {mode === "TC" && (
          <Box fontSize="1.25em" fontWeight="bold">
            {t("plans;towerControlShort")}
          </Box>
        )}
      </Flex>
      <Flex
        flexDir="column"
        p="10px"
        style={{ filter: mode === "RM" ? undefined : "grayscale(100%)" }}
        cursor="pointer"
        onClick={() => setMode("RM")}
        alignItems="center"
      >
        <Box
          _hover={{ transform: mode === "RM" ? undefined : "scale(1.2)" }}
          transition="all 0.2s"
        >
          <Image
            src={rm}
            display="inline-block"
            w={iconSize}
            h={iconSize}
            title={t("game;Rainmaker")}
          />
        </Box>
        {mode === "RM" && (
          <Box fontSize="1.25em" fontWeight="bold">
            {t("plans;rainMakerShort")}
          </Box>
        )}
      </Flex>
      <Flex
        flexDir="column"
        p="10px"
        style={{ filter: mode === "CB" ? undefined : "grayscale(100%)" }}
        cursor="pointer"
        onClick={() => setMode("CB")}
        alignItems="center"
      >
        <Box
          _hover={{ transform: mode === "CB" ? undefined : "scale(1.2)" }}
          transition="all 0.2s"
        >
          <Image
            src={cb}
            display="inline-block"
            w={iconSize}
            h={iconSize}
            title={t("game;Clam Blitz")}
          />
        </Box>
        {mode === "CB" && (
          <Box fontSize="1.25em" fontWeight="bold">
            {t("plans;clamBlitzShort")}
          </Box>
        )}
      </Flex>
    </Flex>
  )
}

export default ModeButtons
