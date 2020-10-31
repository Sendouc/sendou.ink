import { Button, Text } from "@chakra-ui/core";
import MyHead from "components/MyHead";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/Table";
import WeaponImage from "components/WeaponImage";
import { XRankPlacementsQuery } from "generated/graphql";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import Image from "next/image";

interface Props {
  placements: NonNullable<XRankPlacementsQuery["xRankPlacements"]>;
}

const XSearch: React.FC<Props> = ({ placements }) => {
  const { t } = useTranslation();
  const { gray, themeColor } = useMyTheme();
  console.log({ placements });
  return (
    <>
      <MyHead title="Top 500 Browser" />
      {/* <PageHeader title="Top 500 Browser" />
      <Top500Filters
        filter={filter}
        handleChange={(newFilter) => {
          setFilter({ ...filter, ...newFilter });
          setPage(1);
        }}
      /> */}
      <Table maxW="50rem">
        <TableHead>
          <TableRow>
            <TableHeader>{t("xsearch;Name")}</TableHeader>
            <TableHeader>{t("freeagents;Weapon")}</TableHeader>
            <TableHeader>{t("xsearch;X Power")}</TableHeader>
            <TableHeader p={1}>{t("xsearch;Placement")}</TableHeader>
            <TableHeader>{t("xsearch;Mode")}</TableHeader>
            <TableHeader>{t("xsearch;Month")}</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {placements.map((record) => {
            return (
              <TableRow key={record.id}>
                <TableCell>
                  {/* {record.user ? (
                    <Flex alignItems="center">
                      <ChakraLink
                        as={Link}
                        color={themeColor}
                        to={record.user.profilePath}
                      >
                        <Avatar
                          src={record.user.avatarUrl}
                          size="sm"
                          name={record.user.fullUsername}
                          mr="0.5rem"
                        />
                      </ChakraLink>
                      {record.playerName}
                    </Flex>
                  ) : (
                    <>{record.playerName}</>
                  )} */}
                  {record.playerName}
                </TableCell>
                <TableCell>
                  <WeaponImage name={record.weapon} size={32} />
                </TableCell>
                <TableCell>
                  <Text fontWeight="bold">{record.xPower}</Text>
                </TableCell>
                <TableCell color={gray}>{record.ranking}</TableCell>
                <TableCell>
                  <Image
                    src={`/modes/${record.mode}.png`}
                    alt={record.mode}
                    width={32}
                    height={32}
                  />
                </TableCell>
                <TableCell color={gray}>
                  {record.month}/{record.year}
                </TableCell>
                <TableCell>
                  <Button
                    size="xs"
                    onClick={() => {
                      /*setFilter({ playerId: record.playerId });
                        setPage(1);*/
                      console.log(record.playerId);
                    }}
                    variant="outline"
                  >
                    {t("xsearch;ID")}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default XSearch;
