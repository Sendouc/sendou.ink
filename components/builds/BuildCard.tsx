import {
  Box,
  BoxProps,
  Flex,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { Plural, t, Trans } from "@lingui/macro";
import { Ability } from "@prisma/client";
import UserAvatar from "components/common/UserAvatar";
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
import ViewAP from "./ViewAP";
//import ViewAP from "./ViewAP";
import ViewSlots from "./ViewSlots";

interface BuildCardProps {
  build: Unpacked<Unpacked<GetBuildsByWeaponData>>;
  canModify?: boolean;
  //setBuildBeingEdited?: (build: Build) => void;
  otherBuildCount?: number;
  onShowAllByUser?: () => void;
  showWeaponImage?: boolean;
}

const BuildCard: React.FC<BuildCardProps & BoxProps> = ({
  build,
  canModify,
  //setBuildBeingEdited,
  otherBuildCount,
  onShowAllByUser,
  showWeaponImage,
  ...props
}) => {
  const [apView, setApView] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const { themeColorShade, secondaryBgColor, gray } = useMyTheme();

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
        boxShadow="md"
        bg={secondaryBgColor}
        p="20px"
        {...props}
      >
        <Box display="flex" flexDirection="column" h="100%">
          {showWeaponImage && (
            <Box>
              <WeaponImage name={build.weapon} size={64} />
            </Box>
          )}
          {build.title && (
            <Box fontWeight="semibold" as="h4" lineHeight="tight" mt="0.3em">
              {build.title}
            </Box>
          )}
          {build.user && (
            <Box
              my={2}
              textOverflow="ellipsis"
              color={gray}
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="sm"
              whiteSpace="nowrap"
              overflow="hidden"
              title={`${build.user.username}#${build.user.discriminator}`}
            >
              <Link href={`/u/${build.user.discordId}`}>
                <a>
                  <Flex alignItems="center">
                    <UserAvatar user={build.user} isSmall mr={2} />
                    {build.user.username}#{build.user.discriminator}
                  </Flex>
                </a>
              </Link>
            </Box>
          )}
          <Flex alignItems="center">
            <Box
              color={gray}
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              title={build.updatedAt.toLocaleString()}
              mr={2}
            >
              {build.updatedAt.toLocaleDateString()}
            </Box>
            {build.jpn ? (
              <>{getEmojiFlag("JP")}</>
            ) : build.top500 ? (
              <Image
                src={`/layout/xsearch.png`}
                height={24}
                width={24}
                title={t`Maker of the build has finished in the top 500 of X Rank with this weapon`}
              />
            ) : null}
          </Flex>
          <Flex mt="0.3em">
            <IconButton
              variant="ghost"
              isRound
              onClick={() => setApView(!apView)}
              aria-label="Set build card view"
              fontSize="20px"
              icon={<FiTarget />}
              mr="0.5em"
            />
            <IconButton
              variant="ghost"
              isRound
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
            {apView ? (
              <ViewAP aps={build.abilityPoints as Record<Ability, number>} />
            ) : (
              <ViewSlots build={build} />
            )}
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt="1em"
          >
            {otherBuildCount ? (
              <Box
                mx="auto"
                fontSize="0.8em"
                color={themeColorShade}
                textAlign="center"
                onClick={onShowAllByUser}
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                <Plural
                  value={otherBuildCount}
                  one={<Trans>Show # more build by {username}</Trans>}
                  other={<Trans>Show # more builds by {username}</Trans>}
                />
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default BuildCard;
