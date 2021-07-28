import { Box, Image } from "@chakra-ui/react";
import { useRouter } from "next/dist/client/router";
import { CSSVariables } from "utils/CSSVariables";
import { getFilters } from "utils/getFilters";
import FooterContent from "./FooterContent";
import FooterWaves from "./FooterWaves";

const Footer: React.FC = () => {
  const imgBase =
    useRouter().asPath.charCodeAt(1) % 2 === 0 ? "boing" : "b8ing";

  return (
    <Box as="footer" mt="auto" display="grid" gridTemplateColumns="1fr">
      <Image
        src={`/layout/${imgBase}_bg.png`}
        w="80px"
        ml="auto"
        mr="35%"
        mb="-5.1%"
        mt="5rem"
        userSelect="none"
        loading="lazy"
        alt=""
        filter={getFilters(
          getComputedStyle(document.body)
            .getPropertyValue("--custom-theme-color")
            .trim() ||
            getComputedStyle(document.body)
              .getPropertyValue("--theme-color")
              .trim()
        )}
        gridRow="1"
        gridColumn="1 / 2"
        zIndex="1"
      />
      <Image
        src={`/layout/${imgBase}.png`}
        w="80px"
        ml="auto"
        mr="35%"
        mb="-5.1%"
        mt="5rem"
        userSelect="none"
        loading="lazy"
        alt=""
        gridRow="1"
        gridColumn="1 / 2"
        zIndex="10"
      />
      <FooterWaves />
      <FooterContent />
    </Box>
  );
};

export default Footer;
