import { Box, Flex } from "@chakra-ui/layout";
import { useMyTheme } from "hooks/common";
import Image from "next/image";

const HeaderBanner = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => {
  const { secondaryBgColor, gray } = useMyTheme();
  return (
    <Flex
      bg={secondaryBgColor}
      flexWrap="wrap"
      boxShadow="lg"
      justify={["flex-start", null, "center"]}
      mt={4}
      mb={2}
      h={12}
    >
      <Box mt="-1rem" ml={[3, null, 0]}>
        <Image
          src={`/layout/${icon}.png`}
          height={80}
          width={80}
          alt={`${icon} logo`}
          priority
        />
      </Box>
      <Flex align="center" mb={5}>
        <Box mx={2} fontWeight="bold" fontSize={["1.25rem", null, "1rem"]}>
          {title}
        </Box>
        <Box
          mt="1px"
          display={["none", null, "block"]}
          fontSize="sm"
          color={gray}
        >
          {subtitle}
        </Box>
      </Flex>
    </Flex>
  );
};

export default HeaderBanner;
