import { Avatar, Box, Flex, Heading } from "@chakra-ui/core";
import Flag from "components/Flag";
import WeaponImage from "components/WeaponImage";
import { GetUserByIdentifierQuery } from "generated/graphql";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import { FaGamepad, FaTwitch, FaYoutube } from "react-icons/fa";

interface AvatarWithInfoProps {
  user: NonNullable<GetUserByIdentifierQuery["getUserByIdentifier"]>;
}

const AvatarWithInfo: React.FC<AvatarWithInfoProps> = ({ user }) => {
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
      <Flex flexWrap="wrap">
        <Avatar
          data-cy="profile-page-avatar"
          name={user.fullUsername}
          src={user.avatarUrl ?? ""}
          size="2xl"
          mr="0.3em"
          mb="0.5rem"
        />
        <Flex flexDirection="column" justifyContent="center" mb="0.5rem">
          <Flex alignItems="center" my="0.2rem">
            <Heading fontFamily="'Rubik', sans-serif" size="lg" ml="0.5rem">
              {user.fullUsername}
            </Heading>
            {user.profile?.country && <Flag code={user.profile.country} />}
          </Flex>
          <Flex>
            <Flex maxW="300px" flexWrap="wrap">
              {/* FIXME:
              user.twitter_name && (
                <Flex
                  alignItems="center"
                  mx="0.5em"
                  my="0.1em"
                  color={gray}
                >
                  <Box as={FaTwitter} mr="0.2em" />
                  <a href={`https://twitter.com/${user.twitter_name}`}>
                    {user.twitter_name}
                  </a>
                </Flex>
              )*/}
              {user.profile?.twitchName && (
                <Flex alignItems="center" mx="0.5em" my="0.1em" color={gray}>
                  <Box as={FaTwitch} mr="0.2em" />
                  <a href={`https://www.twitch.tv/${user.profile.twitchName}`}>
                    {user.profile.twitchName}
                  </a>
                </Flex>
              )}
              {user.profile?.youtubeId && (
                <Flex alignItems="center" mx="0.5em" my="0.1em" color={gray}>
                  <Box as={FaYoutube} mr="0.2em" />
                  <a
                    href={`https://youtube.com/channel/${user.profile.youtubeId}`}
                  >
                    YouTube
                  </a>
                </Flex>
              )}
              {user.profile?.sensStick &&
                (!!user.profile.sensStick || user.profile.sensStick === 0) && (
                  <Flex
                    alignItems="center"
                    mx="0.5em"
                    my="0.1em"
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
              {user.profile?.weaponPool.length && (
                <Flex mt="0.2rem" w="100%">
                  {user.profile.weaponPool.map((wpn) => (
                    <Box mx="0.2em" key={wpn}>
                      <WeaponImage englishName={wpn} size="SMALL" />
                    </Box>
                  ))}
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default AvatarWithInfo;
