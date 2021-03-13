import { Box, Center, Flex } from "@chakra-ui/react";
import Flag from "components/common/Flag";
import MyLink from "components/common/MyLink";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { useMyTheme } from "hooks/common";
import { GetTeamData } from "prisma/queries/getTeam";
import { Unpacked } from "utils/types";

interface Props {
  user: Unpacked<NonNullable<NonNullable<GetTeamData>["roster"]>>;
}

const RosterPlayerBar: React.FC<Props> = ({ user }) => {
  const { secondaryBgColor, themeColorHex } = useMyTheme();
  return (
    <>
      <MyLink href={`/u/${user.discordId}`}>
        <UserAvatar user={user} size="lg" w={[8, null, 12]} h={[8, null, 12]} />
      </MyLink>
      <Flex
        bg={secondaryBgColor}
        h={[8, null, 12]}
        align="center"
        justify="center"
        display={["none", "flex"]}
      >
        {(user.profile?.weaponPool ?? []).map((wpn) => (
          <Center mx="0.2em" key={wpn}>
            <WeaponImage name={wpn} size={32} />
          </Center>
        ))}
      </Flex>

      <MyLink href={`/u/${user.discordId}`}>
        <Flex
          h={[8, null, 12]}
          bg={themeColorHex}
          align="center"
          justify="center"
          textColor="black"
          textTransform="uppercase"
          letterSpacing="wider"
          lineHeight="1rem"
          fontWeight="medium"
          fontSize="sm"
        >
          <Box mr={1}>
            {user.username}#{user.discriminator}
          </Box>{" "}
          {user.profile?.country && <Flag countryCode={user.profile.country} />}
        </Flex>
      </MyLink>
      <Box display={["block", "none"]} />
      <Flex
        bg={secondaryBgColor}
        h={8}
        align="center"
        justify="center"
        display={["flex", "none"]}
        mt="-1rem"
      >
        {(user.profile?.weaponPool ?? []).map((wpn) => (
          <Center mx="0.2em" key={wpn}>
            <WeaponImage name={wpn} size={32} />
          </Center>
        ))}
      </Flex>
    </>
  );
};

export default RosterPlayerBar;
