import {
  Box,
  BoxProps,
  Flex,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/core";
import { t, Trans } from "@lingui/macro";
import WeaponImage from "components/common/WeaponImage";
import { getEmojiFlag } from "countries-list";
import { Unpacked } from "lib/types";
import { useMyTheme } from "lib/useMyTheme";
import Image from "next/image";
import Link from "next/link";
import { GetBuildsByWeaponData } from "prisma/queries/getBuildsByWeapon";
import { useState } from "react";
import { FiBarChart2, FiInfo, FiTarget } from "react-icons/fi";
import Gears from "./Gears";
//import ViewAP from "./ViewAP";
import ViewSlots from "./ViewSlots";

interface BuildCardProps {
  build: Unpacked<GetBuildsByWeaponData>;
  canModify?: boolean;
  //setBuildBeingEdited?: (build: Build) => void;
  otherBuildCount?: number;
  onShowAllByUser?: () => void;
}

const BuildCard: React.FC<BuildCardProps & BoxProps> = ({
  build,
  canModify,
  //setBuildBeingEdited,
  otherBuildCount,
  onShowAllByUser,
  ...props
}) => {
  const [apView, setApView] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { themeColor, secondaryBgColor, gray } = useMyTheme();

  const username = build.user.username;

  return (
    <>
      {/* {showStats && (
        <BuildCardStats build={build} closeModal={() => setShowStats(false)} />
      )} */}
      <Box
        w="300px"
        rounded="lg"
        overflow="hidden"
        boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
        bg={secondaryBgColor}
        p="20px"
        {...props}
      >
        <Box display="flex" flexDirection="column" h="100%">
          <Box display="flex" justifyContent="space-between">
            <Box width="24">
              <WeaponImage name={build.weapon} size={64} />
            </Box>
            {build.top500 && (
              <Image
                src={`/layout/xsearch.png`}
                alt="x rank top 500 logo"
                height={40}
                width={40}
                title={t`Maker of the build has finished in the top 500 of X Rank with this weapon"`}
              />
            )}
            {build.jpn && getEmojiFlag("jp")}
          </Box>
          <Flex alignItems="center">
            <Box
              color={gray}
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              ml="8px"
              title={build.updatedAt.toLocaleString()}
            >
              {build.updatedAt.toLocaleDateString()}
            </Box>
            {build.user && (
              <Box
                style={{ textOverflow: "ellipsis" }}
                color={gray}
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="sm"
                ml="0.25em"
                whiteSpace="nowrap"
                overflow="hidden"
                title={`${build.user.username}#${build.user.discriminator}`}
              >
                •{"  "}
                <Link href={`/u/${build.user.discordId}`}>
                  <a>
                    {build.user.username}#{build.user.discriminator}
                  </a>
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
              colorScheme={themeColor}
              onClick={() => setApView(!apView)}
              aria-label="Set build card view"
              fontSize="20px"
              icon={<FiTarget />}
              mr="0.5em"
            />
            <IconButton
              variant="ghost"
              isRound
              colorScheme={themeColor}
              onClick={() => setShowStats(!showStats)}
              aria-label="Show build stats view"
              fontSize="20px"
              icon={<FiBarChart2 />}
              mr="0.5em"
            />
            {build.description && (
              <Popover placement="top">
                <PopoverTrigger>
                  <IconButton
                    variant="ghost"
                    isRound
                    colorScheme={themeColor}
                    aria-label="Show description"
                    fontSize="20px"
                    icon={<FiInfo />}
                  />
                </PopoverTrigger>
                <PopoverContent
                  zIndex={4}
                  width="220px"
                  backgroundColor={secondaryBgColor}
                >
                  <PopoverBody textAlign="center" whiteSpace="pre-wrap">
                    {build.description}
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            )}
            {/* {canModify && (
              <IconButton
                variant="ghost"
                isRound
                colorScheme={themeColor}
                onClick={
                  setBuildBeingEdited && (() => setBuildBeingEdited(build))
                }
                aria-label="Show description"
                fontSize="20px"
                icon={<FiEdit />}
                ml="0.5em"
              />
            )} */}
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
            {/* {apView ? <ViewAP build={build} /> : <ViewSlots build={build} />} */}
            <ViewSlots build={build} />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt="1em"
          >
            {otherBuildCount && (
              <Box
                mx="auto"
                fontSize="0.8em"
                color={themeColor}
                textAlign="center"
                onClick={onShowAllByUser}
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                <Trans>
                  Show all {otherBuildCount} builds by {username}
                </Trans>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default BuildCard;
