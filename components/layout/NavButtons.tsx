import { Box, Flex } from "@chakra-ui/layout";
import MyLink from "components/common/MyLink";
import UserAvatar from "components/common/UserAvatar";
import { useMyTheme, useUser } from "hooks/common";
import Image from "next/image";
import { navItems } from "utils/constants";

const NavButtons = ({ onButtonClick }: { onButtonClick?: () => void }) => {
  const { bgColor, secondaryBgColor } = useMyTheme();
  const [user] = useUser();
  return (
    <Flex mt={2} flexWrap="wrap" alignItems="center" justifyContent="center">
      {navItems.map(({ code, name }) => {
        return (
          <MyLink key={code} href={"/" + code} isColored={false} noUnderline>
            <Flex
              width="9rem"
              rounded="lg"
              p={1}
              m={2}
              fontSize="sm"
              fontWeight="bold"
              align="center"
              whiteSpace="nowrap"
              bg={secondaryBgColor}
              border="2px solid"
              borderColor={secondaryBgColor}
              _hover={{
                bg: bgColor,
              }}
              onClick={onButtonClick}
            >
              <Image
                src={`/layout/${code}.png`}
                height={32}
                width={32}
                priority
              />
              <Box ml={2}>{name}</Box>
            </Flex>
          </MyLink>
        );
      })}
      {user && (
        <MyLink href={"/u/" + user.discordId} isColored={false} noUnderline>
          <Flex
            width="9rem"
            rounded="lg"
            p={1}
            m={2}
            fontSize="sm"
            fontWeight="bold"
            align="center"
            whiteSpace="nowrap"
            bg={secondaryBgColor}
            border="2px solid"
            borderColor={secondaryBgColor}
            _hover={{
              bg: bgColor,
            }}
            onClick={onButtonClick}
          >
            <UserAvatar user={user} size="sm" />
            <Box ml={2}>My Page</Box>
          </Flex>
        </MyLink>
      )}
    </Flex>
  );
};

export default NavButtons;
