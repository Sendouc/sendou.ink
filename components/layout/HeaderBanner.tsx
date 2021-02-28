import Image from "next/image";
import { Box, Flex } from "@chakra-ui/layout";
import { useMyTheme } from "hooks/common";

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
  const isTASL = icon === "tasl_main";
  return (
    <Flex
      bg={secondaryBgColor}
      flexWrap="wrap"
      boxShadow="lg"
      rounded="md"
      mt={6}
      mb={2}
      h={12}
    >
      <Box mt={isTASL ? "-0.5rem" : "-1rem"}>
        <Image
          src={`/layout/${icon}.png`}
          height={isTASL ? 60 : 80}
          width={isTASL ? 60 : 80}
          alt={`${icon} logo`}
          priority={true}
        />
      </Box>
      <Box
        as="span"
        fontSize="lg"
        mr={2}
        mb={6}
        mt={3}
        ml={2}
        fontWeight="bold"
      >
        {title}
      </Box>
      <Box as="span" mt="16px" fontSize="sm" color={gray}>
        {subtitle}
      </Box>
    </Flex>
  );
};

export default HeaderBanner;
