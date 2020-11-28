import { Link as ChakraLink } from "@chakra-ui/react";
import { useMyTheme } from "lib/useMyTheme";
import NextLink from "next/link";

interface Props {
  children: React.ReactNode;
  href: string;
}

const MyLink: React.FC<Props> = ({ children, href }) => {
  const { themeColorShade } = useMyTheme();
  return (
    <NextLink href={href}>
      <ChakraLink href={href} color={themeColorShade}>
        {children}
      </ChakraLink>
    </NextLink>
  );
};

export default MyLink;
