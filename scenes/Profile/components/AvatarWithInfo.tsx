import { Avatar, Box, Flex, Heading, IconButton } from "@chakra-ui/core";
import Flag from "components/Flag";
import WeaponImage from "components/WeaponImage";
import { GetUserByIdentifierQuery } from "generated/graphql";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import { FaGamepad, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";

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
              {user.profile?.twitterName && (
                <a href={`https://twitter.com/${user.profile.twitterName}`}>
                  <IconButton
                    aria-label="Link to Twitter"
                    icon={<FaTwitter />}
                    color="#1DA1F2"
                    borderRadius="50%"
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
                    borderRadius="50%"
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
                    borderRadius="50%"
                    variant="ghost"
                  />
                </a>
              )}
              {user.profile?.sensStick &&
                (!!user.profile.sensStick || user.profile.sensStick === 0) && (
                  <Flex
                    alignItems="center"
                    ml="0.7rem"
                    mb="0.5rem"
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
