import React, { useState, useContext, useEffect } from "react"
import {
  Image,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Button,
  Box,
  BoxProps,
} from "@chakra-ui/core"
import { Link } from "@reach/router"

import WeaponImage from "../common/WeaponImage"
import { top500 } from "../../assets/imageImports"
import ViewSlots from "./ViewSlots"
import ViewAP from "./ViewAP"
import MyThemeContext from "../../themeContext"
import { Build } from "../../types"
import Gears from "./Gears"
import { FiEdit, FiInfo } from "react-icons/fi"

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
  const { themeColor, darkerBgColor, grayWithShade } = useContext(
    MyThemeContext
  )

  useEffect(() => {
    setApView(defaultToAPView)
  }, [defaultToAPView])

  return (
    <Box
      w="300px"
      rounded="lg"
      overflow="hidden"
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="20px"
      {...props}
    >
      <Box display="flex" flexDirection="column" h="100%">
        <Box display="flex" justifyContent="space-between">
          <Box width="24">
            <WeaponImage englishName={build.weapon} size="BIG" />
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
          mt="1em"
        >
          {new Date(parseInt(build.updatedAt)).toLocaleDateString()}
        </Box>
        {build.title && (
          <Box ml="8px" fontWeight="semibold" as="h4" lineHeight="tight">
            {build.title}
          </Box>
        )}
        {showUser && build.discord_user && (
          <Box
            color={grayWithShade}
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="sm"
            ml="8px"
          >
            <Link to={`/u/${build.discord_user.discord_id}`}>
              {build.discord_user.username}#{build.discord_user.discriminator}
            </Link>
          </Box>
        )}
        <Box mt="1em">
          <Gears build={build} />
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          justifyContent="center"
          mt="1em"
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
                  icon={FiInfo}
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
          {canModify ? (
            <IconButton
              variant="ghost"
              isRound
              variantColor={themeColor}
              onClick={
                setBuildBeingEdited && (() => setBuildBeingEdited(build))
              }
              aria-label="Show description"
              fontSize="20px"
              icon={FiEdit}
            />
          ) : (
            <Button
              variant="ghost"
              variantColor={themeColor}
              aria-label={apView ? "Show gear" : "Show ability point count"}
              fontSize="15px"
              onClick={() => setApView(!apView)}
            >
              {apView ? "GEAR" : "AP"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default BuildCard
