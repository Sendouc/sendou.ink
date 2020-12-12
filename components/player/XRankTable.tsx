import { Text } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import ModeImage from "components/common/ModeImage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/common/Table";
import WeaponImage from "components/common/WeaponImage";
import { getRankingString } from "lib/strings";
import { useMyTheme } from "lib/useMyTheme";
import { GetPlayerWithPlacementsData } from "prisma/queries/getPlayerWithPlacements";

interface Props {
  placements: NonNullable<GetPlayerWithPlacementsData>["placements"];
}

const XRankTable: React.FC<Props> = ({ placements }) => {
  const { gray } = useMyTheme();

  return (
    <Table maxW="50rem">
      <TableHead>
        <TableRow>
          <TableHeader width={4} />
          <TableHeader>
            <Trans>Name</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>X Power</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Mode</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Weapon</Trans>
          </TableHeader>
          <TableHeader width={4}>
            <Trans>Month</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Year</Trans>
          </TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {placements.map((record) => {
          return (
            <TableRow key={record.id}>
              <TableCell color={gray}>
                {getRankingString(record.ranking)}
              </TableCell>
              <TableCell>{record.playerName}</TableCell>
              <TableCell>
                <Text fontWeight="bold">{record.xPower}</Text>
              </TableCell>
              <TableCell>
                <ModeImage mode={record.mode} size={32} />
              </TableCell>
              <TableCell>
                <WeaponImage name={record.weapon} size={32} />
              </TableCell>
              <TableCell>{record.month}</TableCell>
              <TableCell>{record.year}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default XRankTable;
