import Image from "next/image";
import { Flex } from "@chakra-ui/layout";
import { chakra } from "@chakra-ui/system";
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
      <chakra.div mt="-1rem">
        <Image
          src={`/layout/${icon}.png`}
          height={80}
          width={80}
          alt={`${icon} logo`}
          priority={true}
        />
      </chakra.div>
      <chakra.span fontSize="lg" mr={2} mb={6} mt={3} ml={2} fontWeight="bold">
        {title}
      </chakra.span>
      <chakra.span mt="16px" fontSize="sm" color={gray}>
        {subtitle}
      </chakra.span>
    </Flex>
  );
};

export default HeaderBanner;
