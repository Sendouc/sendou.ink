import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { LeagueType, RankedMode } from "@prisma/client";
import ModeImage from "components/common/ModeImage";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { getEmojiFlag } from "countries-list";
import { getFullUsername } from "lib/strings";
import { useMyTheme } from "lib/useMyTheme";
import useUser from "lib/useUser";
import { GetUserByIdentifierData } from "prisma/queries/getUserByIdentifier";
import { Fragment } from "react";
import { FaGamepad, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { RiTrophyLine } from "react-icons/ri";

interface AvatarWithInfoProps {
  user: NonNullable<GetUserByIdentifierData>;
  peakXPowers: Partial<Record<RankedMode, number>>;
  peakLeaguePowers: Partial<Record<LeagueType, number>>;
}

const AvatarWithInfo: React.FC<AvatarWithInfoProps> = ({
  user,
  peakXPowers,
  peakLeaguePowers,
}) => {
  const [loggedInUser] = useUser();
  const { gray, themeColorShade } = useMyTheme();

  function getSensString(
    motion: number | null | undefined,
    stick: number
  ): string {
    const stickSensString = `${stick > 0 ? "+" : ""}${stick} ${t`Stick`}`;
    const motionSensString =
      typeof motion === "number"
        ? ` ${motion > 0 ? "+" : ""}${motion} ${t`Motion`}`
        : "";

    return `${stickSensString} ${motionSensString}`;
  }

  return (
    <>
      <Flex
        flexDir="column"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
        maxW="24rem"
        mx="auto"
      >
        <UserAvatar
          user={user}
          data-cy="profile-page-avatar"
          size="2xl"
          mb="0.5rem"
        />
        <Flex flexDirection="column" justifyContent="center" mb="0.5rem">
          <Flex alignItems="center" justifyContent="center" my="0.2rem">
            <Heading fontFamily="'Rubik', sans-serif" size="lg">
              {getFullUsername(user)}
            </Heading>
            {user.profile?.country && (
              <Box as="span" ml={2}>
                {getEmojiFlag(user.profile.country)}
              </Box>
            )}
          </Flex>
          <Flex alignItems="center" justifyContent="center">
            <Flex flexWrap="wrap" alignItems="center" justifyContent="center">
              {user.profile?.twitterName && (
                <a href={`https://twitter.com/${user.profile.twitterName}`}>
                  <IconButton
                    aria-label="Link to Twitter"
                    icon={<FaTwitter />}
                    color="#1DA1F2"
                    isRound
                    variant="ghost"
                  />
                </a>
              )}
              {user.profile?.twitchName && (
                <a href={`https://www.twitch.tv/${user.profile.twitchName}`}>
                  <IconButton
                    aria-label="Link to Twitch"
                    icon={<FaTwitch />}
                    color="#6441A4"
                    isRound
                    variant="ghost"
                  />
                </a>
              )}
              {user.profile?.youtubeId && (
                <a
                  href={`https://youtube.com/channel/${user.profile.youtubeId}`}
                >
                  <IconButton
                    aria-label="Link to Twitch"
                    icon={<FaYoutube />}
                    color="#FF0000"
                    isRound
                    variant="ghost"
                  />
                </a>
              )}
              {user.profile?.weaponPool && user.profile?.weaponPool.length > 0 && (
                <Flex
                  mt="0.2rem"
                  w="100%"
                  alignItems="center"
                  justifyContent="center"
                >
                  {user.profile.weaponPool.map((wpn) => (
                    <Box mx="0.2em" key={wpn}>
                      <WeaponImage name={wpn} size={32} />
                    </Box>
                  ))}
                </Flex>
              )}
              {typeof user.profile?.sensStick === "number" && (
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  ml="0.7rem"
                  mt={1}
                  color={gray}
                  w="100%"
                >
                  <Box as={FaGamepad} mr="0.2em" />
                  {getSensString(
                    user.profile.sensMotion,
                    user.profile.sensStick
                  )}
                </Flex>
              )}
              {Object.keys(peakXPowers).length > 0 && (
                <Flex mt={8} w="100%">
                  {(["SZ", "TC", "RM", "CB"] as RankedMode[])
                    .filter((mode) => peakXPowers[mode])
                    .map((mode, i) => (
                      <Fragment key={mode}>
                        <Flex align="center" justify="center" mx="auto">
                          {i !== 0 && <Divider orientation="vertical" mx={2} />}
                          <ModeImage mode={mode} size={32} />{" "}
                          <Box ml={2} color={gray}>
                            {peakXPowers[mode]}
                          </Box>
                        </Flex>
                      </Fragment>
                    ))}
                </Flex>
              )}

              {process.env.NODE_ENV === "development" &&
                Object.keys(peakLeaguePowers).length > 0 && (
                  <Flex mt={4}>
                    {(["TWIN", "QUAD"] as LeagueType[])
                      .filter((type) => peakLeaguePowers[type])
                      .map((type) => (
                        <Fragment key={type}>
                          <Flex align="center" justify="center" mx={2}>
                            <Box ml={2} color={gray}>
                              <SubText>{type}</SubText>
                              {peakLeaguePowers[type]}
                            </Box>
                          </Flex>
                        </Fragment>
                      ))}
                  </Flex>
                )}
              <Box width="100%" textAlign="center" mt={4}>
                {!!user.player?.switchAccountId && (
                  <MyLink
                    href={`/player/${user.player?.switchAccountId}`}
                    prefetch={true}
                  >
                    <Button leftIcon={<RiTrophyLine />} variant="outline">
                      <Trans>View results</Trans>
                    </Button>
                  </MyLink>
                )}
              </Box>
              <Top500HelpText />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );

  function Top500HelpText() {
    if (Object.keys(peakXPowers).length > 0 || user.id !== loggedInUser?.id)
      return null;

    return (
      <Box color={gray} mt={2} textAlign="center">
        <Box as={FiInfo} mx="auto" color={themeColorShade} />
        <Trans>
          If you have finished a month in the Top 500 you can get your peak
          ranks showing here. Simply DM Sendou#4059 on Discord with the month,
          mode and your in-game name.
        </Trans>
      </Box>
    );
  }
};

export default AvatarWithInfo;
