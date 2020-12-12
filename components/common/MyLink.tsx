import { Link as ChakraLink } from "@chakra-ui/react";
import { useMyTheme } from "lib/useMyTheme";
import NextLink from "next/link";

interface Props {
  children: React.ReactNode;
  href: string;
  isExternal?: boolean;
  prefetch?: boolean;
  isColored?: boolean;
}

const MyLink: React.FC<Props> = ({
  children,
  href,
  isExternal,
  prefetch = false,
  isColored = true,
}) => {
  const { themeColorShade } = useMyTheme();

  if (isExternal) {
    return (
      <ChakraLink href={href} color={isColored ? themeColorShade : undefined}>
        {children}
      </ChakraLink>
    );
  }
  return (
    <NextLink href={href} prefetch={prefetch ? undefined : false} passHref>
      <ChakraLink color={isColored ? themeColorShade : undefined}>
        {children}
      </ChakraLink>
    </NextLink>
  );
};

export default MyLink;
