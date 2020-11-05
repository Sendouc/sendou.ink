import { Avatar, Text } from "@chakra-ui/core";
import { Trans } from "@lingui/macro";
import { GetXRankPlacementsQuery } from "generated/graphql";
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
import { useMyTheme } from "lib/useMyTheme";
import Link from "next/link";

interface Props {
  placements: NonNullable<GetXRankPlacementsQuery["getXRankPlacements"]>;
}

const XSearch: React.FC<Props> = ({ placements }) => {
  const { gray } = useMyTheme();

  return (
    <>
      <Table maxW="50rem">
        <TableHead>
          <TableRow>
            <TableHeader width={4} />
            <TableHeader width={4} />
            <TableHeader>
              <Trans>Name</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>X Power</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Weapon</Trans>
            </TableHeader>
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
