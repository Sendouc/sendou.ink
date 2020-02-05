import React, { useState, useContext, useEffect } from "react"
import {
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
import { FaInfo, FaEdit } from "react-icons/fa"

import WeaponImage from "../common/WeaponImage"
import { top500 } from "../../assets/imageImports"
import ViewSlots from "./ViewSlots"
import ViewAP from "./ViewAP"
import MyThemeContext from "../../themeContext"
import { Build } from "../../types"
import Gears from "./Gears"
import Box from "../elements/Box"

interface BuildCardProps {
  build: Build
  defaultToAPView: boolean
  showUser?: boolean
  canModify?: boolean
  setBuildBeingEdited?: (build: Build) => void
}

const BuildCard: React.FC<BuildCardProps & BoxProps> = ({
  build,
  defaultToAPView,
  canModify,
  setBuildBeingEdited,
  showUser,
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
      display="block"
      borderWidth="1px"
      border={borderStyle}
      w="300px"
      rounded="lg"
      overflow="hidden"
      //pb={showUser && build.discord_user ? "20px" : "15px"}
      p="15px"
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
      <Box display="flex" flexDirection="column" h="100%">
        <Box display="flex" justifyContent="space-between">
          <Box width="24">
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
        </Box>
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
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          justifyContent="center"
        >
          {apView ? <ViewAP build={build} /> : <ViewSlots build={build} />}
        </Box>
        <Box display="flex" justifyContent="space-between" mt="1em">
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
            <Box w="24px" />
          )}
          {canModify && (
            <IconButton
              variant="ghost"
              isRound
              variantColor={themeColor}
              onClick={
                setBuildBeingEdited && (() => setBuildBeingEdited(build))
              }
              aria-label="Show description"
              fontSize="20px"
              icon={FaEdit}
            />
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
        </Box>
      </Box>
    </Box>
  )
}

export default BuildCard
