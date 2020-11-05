import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/core";
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
  const { themeColor } = useMyTheme();
  return (
    <>
      <MyHead title={pages[pages.length - 1].name} />
      <Breadcrumb
        mt={4}
        mb={8}
        fontWeight="bold"
        separator={
          <Box as="span" color={themeColor}>
            /
          </Box>
        }
      >
        <BreadcrumbItem>
          <NextLink href="/">
            <BreadcrumbLink>
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </NextLink>
        </BreadcrumbItem>

        {pages.map((page, i) => (
          <BreadcrumbItem isCurrentPage={i === pages.length - 1}>
            {page.link ? (
              <NextLink href={page.link}>
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
