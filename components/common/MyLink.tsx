import { Link as ChakraLink } from "@chakra-ui/react";
import { useMyTheme } from "lib/useMyTheme";
import NextLink from "next/link";

interface Props {
  children: React.ReactNode;
  href: string;
  isExternal?: boolean;
}

const MyLink: React.FC<Props> = ({ children, href, isExternal }) => {
  const { themeColorShade } = useMyTheme();

  if (isExternal) {
    return <ChakraLink color={themeColorShade}>{children}</ChakraLink>;
  }
  return (
    <NextLink href={href}>
      <ChakraLink color={themeColorShade}>{children}</ChakraLink>
    </NextLink>
  );
};

export default MyLink;
