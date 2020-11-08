import { Box, Image, useColorModeValue } from "@chakra-ui/core";
import { useMyTheme } from "lib/useMyTheme";
import { useRouter } from "next/dist/client/router";
import footerOctoDark from "public/layout/b8ing_dark.png";
import footerOctoLight from "public/layout/b8ing_light.png";
import footerSquidDark from "public/layout/boing_dark.png";
import footerSquidLight from "public/layout/boing_light.png";
import FooterContent from "./FooterContent";
import FooterWaves from "./FooterWaves";

const Footer: React.FC = () => {
  const species = useRouter().asPath.charCodeAt(1) % 2 === 0 ? "squid" : "octo";
  const { themeColor } = useMyTheme();
  const footerImageSrc = useColorModeValue(
    { octo: footerOctoLight, squid: footerSquidLight },
    { octo: footerOctoDark, squid: footerSquidDark }
  )[species];

  return (
    <Box as="footer" mt="auto">
      <Image
        src={footerImageSrc}
        bg={themeColor}
        w="80px"
        ml="auto"
        mr="35%"
        mb="-5.1%"
        mt="5rem"
        userSelect="none"
        loading="lazy"
      />
      <FooterWaves />
      <FooterContent />
    </Box>
  );
};

export default Footer;
