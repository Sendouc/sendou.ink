import { Box, Image, useColorModeValue } from "@chakra-ui/react";
import { useMyTheme } from "hooks/common";
import { useRouter } from "next/dist/client/router";
import FooterContent from "./FooterContent";
import FooterWaves from "./FooterWaves";

const Footer: React.FC = () => {
  const species = useRouter().asPath.charCodeAt(1) % 2 === 0 ? "squid" : "octo";
  const { themeColorHex: themeColor } = useMyTheme();
  const footerImageSrc = useColorModeValue(
    { octo: "b8ing_light", squid: "boing_light" },
    { octo: "b8ing_dark", squid: "boing_dark" }
  )[species];

  return (
    <Box as="footer" mt="auto">
      <Image
        src={`/layout/${footerImageSrc}.png`}
        bg={themeColor}
        w="80px"
        ml="auto"
        mr="35%"
        mb="-5.1%"
        mt="5rem"
        userSelect="none"
        loading="lazy"
        alt=""
      />
      <FooterWaves />
      <FooterContent />
    </Box>
  );
};

export default Footer;
