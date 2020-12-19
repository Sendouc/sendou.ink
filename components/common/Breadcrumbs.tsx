import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useMyTheme } from "lib/useMyTheme";
import NextLink from "next/link";
import MyHead from "./MyHead";

interface Props {
  pages: {
    name: string;
    link?: string;
  }[];
}

const Breadcrumbs: React.FC<Props> = ({ pages }) => {
  const { themeColorShade } = useMyTheme();
  return (
    <>
      <MyHead title={pages[pages.length - 1].name} />
      <Breadcrumb
        mt={2}
        mb={8}
        fontWeight="bold"
        separator={
          <Box as="span" color={themeColorShade}>
            /
          </Box>
        }
      >
        <BreadcrumbItem>
          <NextLink href="/" passHref>
            <BreadcrumbLink>
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </NextLink>
        </BreadcrumbItem>

        {pages.map((page, i) => (
          <BreadcrumbItem
            key={page.name}
            isCurrentPage={i === pages.length - 1}
          >
            {page.link ? (
              <NextLink href={page.link} passHref>
                <BreadcrumbLink>{page.name}</BreadcrumbLink>
              </NextLink>
            ) : (
              <BreadcrumbLink>{page.name}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </>
  );
};

export default Breadcrumbs;
