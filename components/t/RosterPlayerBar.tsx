import { Box, Center, Flex } from "@chakra-ui/react";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { getEmojiFlag } from "countries-list";
import { useMyTheme } from "hooks/common";
import { Unpacked } from "lib/types";
import { GetTeamData } from "prisma/queries/getTeam";

interface Props {
  user: Unpacked<NonNullable<NonNullable<GetTeamData>["roster"]>>;
}

const RosterPlayerBar: React.FC<Props> = ({ user }) => {
  const { secondaryBgColor, themeColorHex } = useMyTheme();
  return (
    <>
      <UserAvatar
        user={user}
        size="lg"
        borderRadius={0}
        w={[8, null, 12]}
        h={[8, null, 12]}
      />
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
        {user.username}#{user.discriminator}{" "}
        {user.profile?.country ? getEmojiFlag(user.profile.country) : ""}
      </Flex>
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
