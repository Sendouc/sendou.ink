import {
  Box,
  BoxProps,
  Flex,
  IconButton,
  Image,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  PseudoBox,
} from "@chakra-ui/core"
import { Link } from "@reach/router"
import React, { useContext, useEffect, useState } from "react"
import { FiBarChart2, FiEdit, FiInfo, FiTarget } from "react-icons/fi"
import { top500 } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { Build } from "../../types"
import WeaponImage from "../common/WeaponImage"
import BuildCardStats from "./BuildCardStats"
import Gears from "./Gears"
import ViewAP from "./ViewAP"
import ViewSlots from "./ViewSlots"

interface BuildCardProps {
  build: Build
  defaultToAPView: boolean
  showUser?: boolean
  canModify?: boolean
  setBuildBeingEdited?: (build: Build) => void
  otherBuildCount?: number
  onShowAllByUser?: () => void
}

const BuildCard: React.FC<BuildCardProps & BoxProps> = ({
  build,
  defaultToAPView,
  canModify,
  showUser,
  setBuildBeingEdited,
  otherBuildCount,
  onShowAllByUser,
  ...props
}) => {
  const [apView, setApView] = useState(defaultToAPView)
  const [showStats, setShowStats] = useState(false)
  const {
    themeColor,
    darkerBgColor,
    grayWithShade,
    themeColorWithShade,
  } = useContext(MyThemeContext)

  useEffect(() => {
    setApView(defaultToAPView)
  }, [defaultToAPView])

  return (
    <>
      {showStats && (
        <BuildCardStats build={build} closeModal={() => setShowStats(false)} />
      )}
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
          <Flex alignItems="center">
            <Box
              color={grayWithShade}
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              ml="8px"
              title={new Date(parseInt(build.updatedAt)).toLocaleString()}
            >
              {new Date(parseInt(build.updatedAt)).toLocaleDateString()}
            </Box>
            {showUser && build.discord_user && (
              <Box
                style={{ textOverflow: "ellipsis" }}
                color={grayWithShade}
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="sm"
                ml="0.25em"
                whiteSpace="nowrap"
                overflow="hidden"
                title={`${build.discord_user.username}#${build.discord_user.discriminator}`}
              >
                •{"  "}
                <Link to={`/u/${build.discord_user.discord_id}`}>
                  {build.discord_user.username}#
                  {build.discord_user.discriminator}
                </Link>
              </Box>
            )}
          </Flex>
          {build.title && (
            <Box
              ml="8px"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
              mt="0.3em"
            >
              {build.title}
            </Box>
          )}
          <Flex mt="0.3em">
            <IconButton
              variant="ghost"
              isRound
              variantColor={themeColor}
              onClick={() => setApView(!apView)}
              aria-label="Set build card view"
              fontSize="20px"
              icon={FiTarget}
              mr="0.5em"
            />
            <IconButton
              variant="ghost"
              isRound
              variantColor={themeColor}
              onClick={() => setShowStats(!showStats)}
              aria-label="Show build stats view"
              fontSize="20px"
              icon={FiBarChart2}
              mr="0.5em"
            />
            {build.description && (
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
                icon={FiEdit}
                ml="0.5em"
              />
            )}
          </Flex>
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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt="1em"
          >
            {otherBuildCount && (
              <PseudoBox
                mx="auto"
                fontSize="0.8em"
                color={themeColorWithShade}
                textAlign="center"
                onClick={onShowAllByUser}
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                Show all {otherBuildCount} builds by{" "}
                {build.discord_user!.username}
              </PseudoBox>
            )}
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default BuildCard
