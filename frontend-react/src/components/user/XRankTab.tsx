import React, { useContext } from "react"
import { Placement } from "../../types"
import { modesShort, months } from "../../utils/lists"
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionIcon,
  AccordionPanel,
  Flex,
  Icon,
  Box,
} from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface XRankTabProps {
  placements: Placement[]
}

interface AllModesAccordionData {
  sz?: ModeAccordionData
  tc?: ModeAccordionData
  rm?: ModeAccordionData
  cb?: ModeAccordionData
}

interface ModeAccordionData {
  highestPlacement: number
  highestPlacementDate: string
  highestXPower: number
  highestXPowerDate: string
  placements: Placement[]
}

interface StyleBoxProps {
  children: string | string[] | number | undefined
  color?: string
  size?: string
}

const StyledBox: React.FC<StyleBoxProps> = ({ children, color, size }) => (
  <Box
    color={color ?? undefined}
    width="32px"
    minH="45px"
    letterSpacing="wide"
    fontSize={size ?? "xs"}
    textTransform="uppercase"
    fontWeight="semibold"
    textAlign="center"
  >
    {children}
  </Box>
)

const accordionReducer = function(
  acc: AllModesAccordionData,
  cur: Placement
): AllModesAccordionData {
  const key = modesShort[cur.mode]
  const modeData = acc[key]
  const date = `${months[cur.month]} ${cur.year}`
  if (!modeData) {
    acc[key] = {
      highestPlacement: cur.rank,
      highestPlacementDate: date,
      highestXPower: cur.x_power,
      highestXPowerDate: date,
      placements: [cur],
    }
  } else {
    modeData.placements.push(cur)

    if (cur.x_power > modeData.highestXPower) {
      modeData.highestXPower = cur.x_power
      modeData.highestXPowerDate = date
    }

    if (cur.rank < modeData.highestPlacement) {
      modeData.highestPlacement = cur.rank
      modeData.highestPlacementDate = date
    }
  }

  return acc
}

const XRankTab: React.FC<XRankTabProps> = ({ placements }) => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext)

  const allModesTabsData: AllModesAccordionData = placements.reduce(
    accordionReducer,
    {}
  )
  console.log(allModesTabsData)
  return (
    <>
      <Accordion allowMultiple>
        {(["sz", "tc", "rm", "cb"] as const)
          .filter(key => allModesTabsData.hasOwnProperty(key))
          .map(key => {
            return (
              <AccordionItem key={key}>
                <AccordionHeader>
                  <AccordionIcon size="2em" mr="1em" />
                  <Flex
                    justifyContent="flex-start"
                    w="100%"
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Icon
                      name={key as any}
                      color={themeColorWithShade}
                      size="5em"
                    />{" "}
                    <Flex flexDirection="column" minW="100px" ml="50px">
                      <StyledBox color={grayWithShade}>
                        Best placement
                      </StyledBox>
                      <StyledBox size="s">
                        {allModesTabsData[key]?.highestPlacement}
                      </StyledBox>
                      <StyledBox color={grayWithShade}>
                        {allModesTabsData[key]?.highestPlacementDate}
                      </StyledBox>
                    </Flex>
                    <Flex flexDirection="column" minW="120px">
                      <StyledBox color={grayWithShade}>
                        Highest X Power
                      </StyledBox>
                      <StyledBox size="s">
                        {allModesTabsData[key]?.highestXPower}
                      </StyledBox>
                      <StyledBox color={grayWithShade}>
                        {allModesTabsData[key]?.highestXPowerDate}
                      </StyledBox>
                    </Flex>
                    <Flex flexDirection="column" minW="100px">
                      <StyledBox color={grayWithShade}>
                        Number of placements
                      </StyledBox>
                      <StyledBox size="s">
                        {allModesTabsData[key]?.placements.length}
                      </StyledBox>
                      <Box />
                    </Flex>
                  </Flex>
                </AccordionHeader>
                <AccordionPanel pb={4}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </AccordionPanel>
              </AccordionItem>
            )
          })}
      </Accordion>
    </>
  )
}

export default XRankTab
