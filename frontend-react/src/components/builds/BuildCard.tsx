import React, { useState, useContext, useEffect } from "react"
import {
  Box,
  Flex,
  Image,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Button,
  BoxProps,
} from "@chakra-ui/core"
import { Link } from "@reach/router"
import { FaInfo } from "react-icons/fa"

import WeaponImage from "../common/WeaponImage"
import { top500 } from "../../assets/imageImports"
import ViewSlots from "./ViewSlots"
import ViewAP from "./ViewAP"
import MyThemeContext from "../../themeContext"
import { Build } from "../../types"
import Gears from "./Gears"

interface BuildCardProps {
  build: Build
  defaultToAPView: boolean
  showUser?: boolean
}

const BuildCard: React.FC<BuildCardProps & BoxProps> = ({
  build,
  defaultToAPView,
  showUser = false,
  ...props
}) => {
  const [apView, setApView] = useState(defaultToAPView)
  const { borderStyle, themeColor, darkerBgColor, grayWithShade } = useContext(
    MyThemeContext
  )

  useEffect(() => {
    setApView(defaultToAPView)
  }, [defaultToAPView])

  return (
    <Box
      as="fieldset"
      width="325px"
      borderWidth="1px"
      border={borderStyle}
      rounded="lg"
      overflow="hidden"
      pt="2"
      pb="6"
      px="6"
      {...props}
    >
      {showUser && build.discord_user && (
        <Box
          as="legend"
          color={grayWithShade}
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="s"
        >
          <Link to={`/u/${build.discord_user.discord_id}`}>
            {build.discord_user.username}#{build.discord_user.discriminator}
          </Link>
        </Box>
      )}
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
        ml="8px"
      >
        {new Date(parseInt(build.updatedAt)).toLocaleString()}
      </Box>
      {build.title && (
        <Box ml="8px" fontWeight="semibold" as="h4" lineHeight="tight">
          {build.title}
        </Box>
      )}
      <Gears build={build} />
      {apView ? <ViewAP build={build} /> : <ViewSlots build={build} />}
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
        <Button
          variant="ghost"
          variantColor={themeColor}
          aria-label={apView ? "Show gear" : "Show ability point count"}
          fontSize="15px"
          onClick={() => setApView(!apView)}
        >
          {apView ? "GEAR" : "AP"}
        </Button>
      </Flex>
    </Box>
  )
}

export default BuildCard
