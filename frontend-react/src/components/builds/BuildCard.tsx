import React, { useState, useContext } from "react"
import { Build } from "../../types"
import {
  Box,
  Flex,
  Image,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/core"
import WeaponImage from "../common/WeaponImage"
import { top500 } from "../../assets/imageImports"
import { FaInfo, FaPlus, FaMinus } from "react-icons/fa"
import ViewGear from "./ViewGear"
import ViewAP from "./ViewAP"
import MyThemeContext from "../../themeContext"

interface BuildCardProps {
  build: Build
  defaultToAPView: Boolean
}

const BuildCard: React.FC<BuildCardProps> = ({ build, defaultToAPView }) => {
  const [apView, setApView] = useState(defaultToAPView)
  const { borderStyle, themeColor, darkerBgColor, grayWithShade } = useContext(
    MyThemeContext
  )

  return (
    <Box
      width="325px"
      borderWidth="1px"
      border={borderStyle}
      rounded="lg"
      overflow="hidden"
      pt="2"
      pb="6"
      px="6"
    >
      <Flex justifyContent="space-between">
        <Box width="24" height="auto">
          <WeaponImage englishName={build.weapon} size="MEDIUM" />
        </Box>
        {build.top && (
          <Image
            src={top500}
            alt="x rank top 500 logo"
            height="40px"
            width="auto"
            title="Maker of the build has reached top 500 with this weapon"
          />
        )}
      </Flex>
      <Box
        color={grayWithShade}
        fontWeight="semibold"
        letterSpacing="wide"
        fontSize="xs"
      >
        {new Date(parseInt(build.updatedAt)).toLocaleString()}
      </Box>
      {build.title && (
        <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight">
          {build.title}
        </Box>
      )}
      {apView ? <ViewAP build={build} /> : <ViewGear build={build} />}
      <Flex justifyContent="space-between" mt="1em">
        {build.description ? (
          <Popover placement="top">
            <PopoverTrigger>
              <IconButton
                variant="ghost"
                isRound
                variantColor={themeColor}
                aria-label="Show description"
                fontSize="20px"
                icon={FaInfo}
              />
            </PopoverTrigger>
            <PopoverContent
              zIndex={4}
              width="220px"
              backgroundColor={darkerBgColor}
            >
              <PopoverBody textAlign="center" whiteSpace="pre-wrap">
                {build.description}
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ) : (
          <Box />
        )}
        <IconButton
          variant="ghost"
          isRound
          variantColor={themeColor}
          aria-label={apView ? "Show gear" : "Show ability point count"}
          fontSize="20px"
          icon={apView ? FaMinus : FaPlus}
          onClick={() => setApView(!apView)}
        />
      </Flex>
    </Box>
  )
}

export default BuildCard
