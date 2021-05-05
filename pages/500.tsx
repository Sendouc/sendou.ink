import { Box, Flex, Heading } from "@chakra-ui/layout";
import MyLink from "components/common/MyLink";
import { useMyTheme } from "hooks/common";
import Image from "next/image";

const Custom500Page = () => {
  const { gray } = useMyTheme();
  return (
    <Flex flexDirection="column" justifyContent="center" alignItems="center">
      <Image src={`/layout/errorGirl.png`} width={584} height={487} />
      <Heading>500 - Server-side error occurred</Heading>
      <Box color={gray}>
        For assistance please visit our{" "}
        <MyLink href="https://discord.gg/sendou" isExternal>
          Discord
        </MyLink>
      </Box>
    </Flex>
  );
};

export default Custom500Page;
