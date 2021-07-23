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
import { CSSVariables } from "utils/CSSVariables";
import { GetPlayerWithPlacementsData } from "prisma/queries/getPlayerWithPlacements";
import { getRankingString } from "utils/strings";

interface Props {
  player: NonNullable<GetPlayerWithPlacementsData>;
}

const XRankTable: React.FC<Props> = ({ player }) => {
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
        {player.placements.map((record) => {
          return (
            <TableRow key={record.id}>
              <TableCell color={CSSVariables.themeGray}>
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
