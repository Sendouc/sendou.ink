import { Avatar, Text } from "@chakra-ui/core";
import { GetXRankPlacementsQuery } from "generated/graphql";
import MyHead from "lib/components/MyHead";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "lib/components/Table";
import WeaponImage from "lib/components/WeaponImage";
import { getRankingString } from "lib/getRankingString";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import Link from "next/link";

interface Props {
  placements: NonNullable<GetXRankPlacementsQuery["getXRankPlacements"]>;
}

const XSearch: React.FC<Props> = ({ placements }) => {
  const { t } = useTranslation();
  const { gray } = useMyTheme();

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
            <TableHeader width={4} />
            <TableHeader width={4} />
            <TableHeader>{t("xsearch;Name")}</TableHeader>
            <TableHeader>{t("xsearch;X Power")}</TableHeader>
            <TableHeader>{t("freeagents;Weapon")}</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {placements.map((record) => {
            return (
              <TableRow key={record.switchAccountId}>
                <TableCell color={gray}>
                  {getRankingString(record.ranking)}
                </TableCell>
                <TableCell>
                  {record.player.user && (
                    <Link href={record.player.user.profilePath}>
                      <a>
                        <Avatar
                          src={record.player.user.avatarUrl ?? undefined}
                          size="sm"
                          name={record.player.user.fullUsername}
                          mr="0.5rem"
                        />
                      </a>
                    </Link>
                  )}
                </TableCell>
                <TableCell>{record.playerName}</TableCell>
                <TableCell>
                  <Text fontWeight="bold">{record.xPower}</Text>
                </TableCell>
                <TableCell>
                  <WeaponImage name={record.weapon} size={32} />
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
