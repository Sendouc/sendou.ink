import { Box, Flex } from "@chakra-ui/layout";
import MyLink from "components/common/MyLink";
import UserAvatar from "components/common/UserAvatar";
import { useUser } from "hooks/common";
import Image from "next/image";
import { navItems } from "utils/constants";
import { CSSVariables } from "utils/CSSVariables";

const NavButtons = ({ onButtonClick }: { onButtonClick?: () => void }) => {
  const [user] = useUser();
  return (
    <Flex mt={2} flexWrap="wrap" alignItems="center" justifyContent="center">
      {navItems.map(({ imageSrc, code, name }) => {
        return (
          <MyLink key={code} href={"/" + code} isColored={false} noUnderline>
            <Flex
              width="9.5rem"
              rounded="lg"
              p={1}
              m={2}
              fontSize="sm"
              fontWeight="bold"
              align="center"
              whiteSpace="nowrap"
              bg={CSSVariables.secondaryBgColor}
              border="2px solid"
              borderColor={CSSVariables.secondaryBgColor}
              _hover={{
                bg: CSSVariables.bgColor,
              }}
              onClick={onButtonClick}
            >
              <Image
                src={`/layout/${imageSrc ?? code}.png`}
                className={code === "splatoon3" ? "rounded" : undefined}
                height={32}
                width={32}
                priority
                alt={`${name} icon`}
              />
              <Box ml={2}>{name}</Box>
            </Flex>
          </MyLink>
        );
      })}
      {user && (
        <MyLink href={"/u/" + user.discordId} isColored={false} noUnderline>
          <Flex
            width="9.5rem"
            rounded="lg"
            p={1}
            m={2}
            fontSize="sm"
            fontWeight="bold"
            align="center"
            whiteSpace="nowrap"
            bg={CSSVariables.secondaryBgColor}
            border="2px solid"
            borderColor={CSSVariables.secondaryBgColor}
            _hover={{
              bg: CSSVariables.bgColor,
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
