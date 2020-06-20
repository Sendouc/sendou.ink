import React from "react"
import { Flex, Box, Image, PseudoBox } from "@chakra-ui/core"
import sz from "../../assets/sz.png"
import tc from "../../assets/tc.png"
import rm from "../../assets/rm.png"
import cb from "../../assets/cb.png"
import tw from "../../assets/tw.png"

interface ModeButtonsProps {
  mode: "TW" | "SZ" | "TC" | "RM" | "CB"
  setMode: (mode: "TW" | "SZ" | "TC" | "RM" | "CB") => void
  showTW?: boolean
}

const iconSize = "45px"

const ModeButtons: React.FC<ModeButtonsProps> = ({ mode, setMode, showTW }) => {
  return (
    <Flex>
      {showTW && (
        <Flex
          flexDir="column"
          p="10px"
          style={{ filter: mode === "TW" ? undefined : "grayscale(100%)" }}
          cursor="pointer"
          onClick={() => setMode("TW" as any)}
          alignItems="center"
        >
          <PseudoBox
            _hover={{ transform: mode === "TW" ? undefined : "scale(1.2)" }}
            transition="all 0.2s"
          >
            <Image src={tw} display="inline-block" w={iconSize} h={iconSize} />
          </PseudoBox>
          {mode === "TW" && (
            <Box fontSize="1.25em" fontWeight="bold">
              TW
            </Box>
          )}
        </Flex>
      )}
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
