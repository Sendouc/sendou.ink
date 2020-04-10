import React from "react"
import { Flex, Box, Image, PseudoBox } from "@chakra-ui/core"
import sz from "../../assets/sz.png"
import tc from "../../assets/tc.png"
import rm from "../../assets/rm.png"
import cb from "../../assets/cb.png"

interface ModeButtonsProps {
  mode: "SZ" | "TC" | "RM" | "CB"
  setMode: React.Dispatch<React.SetStateAction<"SZ" | "TC" | "RM" | "CB">>
}

const iconSize = "45px"

const ModeButtons: React.FC<ModeButtonsProps> = ({ mode, setMode }) => {
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
        <PseudoBox
          _hover={{ transform: mode === "SZ" ? undefined : "scale(1.2)" }}
          transition="all 0.2s"
        >
          <Image src={sz} display="inline-block" w={iconSize} h={iconSize} />
        </PseudoBox>
        {mode === "SZ" && (
          <Box fontSize="1.25em" fontWeight="bold">
            SZ
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
        <PseudoBox
          _hover={{ transform: mode === "TC" ? undefined : "scale(1.2)" }}
          transition="all 0.2s"
        >
          <Image src={tc} display="inline-block" w={iconSize} h={iconSize} />
        </PseudoBox>
        {mode === "TC" && (
          <Box fontSize="1.25em" fontWeight="bold">
            TC
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
        <PseudoBox
          _hover={{ transform: mode === "RM" ? undefined : "scale(1.2)" }}
          transition="all 0.2s"
        >
          <Image src={rm} display="inline-block" w={iconSize} h={iconSize} />
        </PseudoBox>
        {mode === "RM" && (
          <Box fontSize="1.25em" fontWeight="bold">
            RM
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
        <PseudoBox
          _hover={{ transform: mode === "CB" ? undefined : "scale(1.2)" }}
          transition="all 0.2s"
        >
          <Image src={cb} display="inline-block" w={iconSize} h={iconSize} />
        </PseudoBox>
        {mode === "CB" && (
          <Box fontSize="1.25em" fontWeight="bold">
            CB
          </Box>
        )}
      </Flex>
    </Flex>
  )
}

export default ModeButtons
