import {
  Avatar,
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Link as ChakraLink,
} from "@chakra-ui/core";
import { Trans } from "@lingui/macro";
import { RankedMode } from "@prisma/client";
import ModeImage from "components/common/ModeImage";
import WeaponImage from "components/common/WeaponImage";
import { getEmojiFlag } from "countries-list";
import { getDiscordAvatarUrl, getFullUsername } from "lib/strings";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import NextLink from "next/link";
import { GetUserByIdentifierData } from "prisma/queries/getUserByIdentifier";
import { Fragment } from "react";
import { FaGamepad, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";

interface AvatarWithInfoProps {
  user: NonNullable<GetUserByIdentifierData>;
  peakXPowers: Partial<Record<RankedMode, number>>;
}

// FIXME:  show text on how to get your top 500 linked

const AvatarWithInfo: React.FC<AvatarWithInfoProps> = ({
  user,
  peakXPowers,
}) => {
  const { gray } = useMyTheme();
  const { t } = useTranslation();

  function getSensString(
    motion: number | null | undefined,
    stick: number
  ): string {
    const stickSensString = `${stick > 0 ? "+" : ""}${stick} ${t(
      "users;Stick"
    )}`;
    const motionSensString = !!motion
      ? ` ${motion > 0 ? "+" : ""}${motion} ${t("users;Motion")}`
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
        <Avatar
          data-cy="profile-page-avatar"
          name={getFullUsername(user)}
          src={
            user.discordAvatar
              ? getDiscordAvatarUrl({
                  discordId: user.discordId,
                  discordAvatar: user.discordAvatar,
                })
              : undefined
          }
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
              {user.profile?.sensStick &&
                (!!user.profile.sensStick || user.profile.sensStick === 0) && (
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    ml="0.7rem"
                    mt="0.7rem"
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
                <Flex mt={6}>
                  {(["SZ", "TC", "RM", "CB"] as RankedMode[]).map((mode, i) => (
                    <Fragment key={mode}>
                      {peakXPowers[mode] && (
                        <Flex align="center" justify="center">
                          {i !== 0 && <Divider orientation="vertical" mx={2} />}
                          <ModeImage mode={mode} size={32} />{" "}
                          <Box ml={2} color={gray}>
                            {peakXPowers[mode]}
                          </Box>
                        </Flex>
                      )}
                    </Fragment>
                  ))}
                </Flex>
              )}
              {!!user.player?.switchAccountId && (
                <Box mt={2}>
                  <NextLink href={`/player/${user.player?.switchAccountId}`}>
                    <ChakraLink>
                      <Trans>View all Top 500 results</Trans>
                    </ChakraLink>
                  </NextLink>
                </Box>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default AvatarWithInfo;
