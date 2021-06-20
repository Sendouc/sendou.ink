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
import Flag from "components/common/Flag";
import ModeImage from "components/common/ModeImage";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import TwitterAvatar from "components/common/TwitterAvatar";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { countries } from "countries-list";
import { useMyTheme, useUser } from "hooks/common";
import Image from "next/image";
import { GetUserByIdentifierData } from "prisma/queries/getUserByIdentifier";
import { FaGamepad, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { getFullUsername } from "utils/strings";

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

    return `${motionSensString} ${stickSensString}`;
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
            <Heading size="lg">{getFullUsername(user)}</Heading>
          </Flex>
          {user.profile?.country && (
            <Flex align="center" mx="auto" my={1}>
              <Box as="span" mr={1} mt={1}>
                <Flag countryCode={user.profile.country} />{" "}
              </Box>
              {
                Object.entries(countries).find(
                  ([key]) => key === user.profile!.country
                )![1].name
              }
            </Flex>
          )}
          {user.team && (
            <Flex align="center" justify="center" my={2}>
              {user.team.twitterName && (
                <MyLink href={`/t/${user.team.nameForUrl}`} isColored={false}>
                  <TwitterAvatar
                    twitterName={user.team.twitterName}
                    isSmall
                    mr={2}
                  />
                </MyLink>
              )}
              <MyLink href={`/t/${user.team.nameForUrl}`} isColored={false}>
                <Box fontWeight="bold">{user.team.name}</Box>
              </MyLink>
            </Flex>
          )}
          <Flex alignItems="center" justifyContent="center">
            <Flex flexWrap="wrap" alignItems="center" justifyContent="center">
              <Flex w="100%" alignItems="center" justifyContent="center">
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
                      aria-label="Link to Youtube"
                      icon={<FaYoutube />}
                      color="#FF0000"
                      isRound
                      variant="ghost"
                    />
                  </a>
                )}
              </Flex>
              {user.profile?.weaponPool && user.profile?.weaponPool.length > 0 && (
                <Flex
                  mt={2}
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
                  mt={2}
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
                <Flex mt={2}>
                  {(["SZ", "TC", "RM", "CB"] as RankedMode[])
                    .filter((mode) => peakXPowers[mode])
                    .map((mode, i) => (
                      <Flex
                        key={mode}
                        align="center"
                        justify="center"
                        mx="auto"
                      >
                        {i !== 0 && <Divider orientation="vertical" mx={2} />}
                        <ModeImage mode={mode} size={32} />{" "}
                        <Box ml={2} color={gray}>
                          {peakXPowers[mode]}
                        </Box>
                      </Flex>
                    ))}
                </Flex>
              )}

              {Object.keys(peakLeaguePowers).length > 0 && (
                <>
                  <Box flexBasis="100%" h="0" />
                  <Flex mt={2}>
                    {(["TWIN", "QUAD"] as LeagueType[])
                      .filter((type) => peakLeaguePowers[type])
                      .map((type) => (
                        <Flex key={type} align="center" justify="center" mx={2}>
                          <Box ml={2} color={gray}>
                            <SubText>{type}</SubText>
                            {peakLeaguePowers[type]}
                          </Box>
                        </Flex>
                      ))}
                  </Flex>
                </>
              )}
              <Flex
                width="100%"
                alignItems="center"
                justifyContent="center"
                mt={4}
              >
                {!!user.player?.switchAccountId && (
                  <MyLink
                    href={`/player/${user.player?.switchAccountId}`}
                    prefetch={true}
                  >
                    <Button variant="outline" mx={2} size="sm" w={16}>
                      <Image
                        src="/layout/xsearch.png"
                        height={30}
                        width={30}
                        alt="XSearch"
                        priority
                      />
                    </Button>
                  </MyLink>
                )}
                {!!user.freeAgentPost?.id && (
                  <MyLink
                    href={`/freeagents?id=${user.freeAgentPost.id}`}
                    prefetch={true}
                  >
                    <Button variant="outline" mx={2} size="sm" w={16}>
                      <Image
                        src="/layout/freeagents.png"
                        height={30}
                        width={30}
                        alt="Free Agents"
                        priority
                      />
                    </Button>
                  </MyLink>
                )}
                {user.salmonRunRecords.length > 0 && (
                  <MyLink href={`/sr/player/${user.id}`} prefetch={true}>
                    <Button variant="outline" mx={2} size="sm" w={16}>
                      <Image
                        src="/layout/sr.png"
                        height={30}
                        width={30}
                        alt="SR"
                        priority
                      />
                    </Button>
                  </MyLink>
                )}
              </Flex>
              <Top500HelpText />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );

  function Top500HelpText() {
    if (
      Object.keys(peakXPowers).length > 0 ||
      Object.keys(peakLeaguePowers).length > 0 ||
      user.id !== loggedInUser?.id
    )
      return null;

    return (
      <Box color={gray} mt={2} textAlign="center">
        <Box as={FiInfo} mx="auto" color={themeColorShade} />
        <Trans>
          You can get your peak Top 500 and League powers showing here.{" "}
          <MyLink prefetch href="/linking-info">
            Read more
          </MyLink>
        </Trans>
      </Box>
    );
  }
};

export default AvatarWithInfo;
