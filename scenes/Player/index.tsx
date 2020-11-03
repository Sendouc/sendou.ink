import { Text } from "@chakra-ui/core";
import ModeImage from "components/ModeImage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/Table";
import WeaponImage from "components/WeaponImage";
import { GetPlayersXRankPlacementsQuery } from "generated/graphql";
import { getRankingString } from "lib/getRankingString";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";

interface Props {
  placements: NonNullable<
    GetPlayersXRankPlacementsQuery["getPlayersXRankPlacements"]
  >;
}

const PlayerPage: React.FC<Props> = ({ placements }) => {
  const { t } = useTranslation();
  const { gray } = useMyTheme();
  console.log({ placements });

  return (
    <>
      <Table maxW="50rem">
        <TableHead>
          <TableRow>
            <TableHeader width={4} />
            <TableHeader>{t("xsearch;Name")}</TableHeader>
            <TableHeader>{t("xsearch;X Power")}</TableHeader>
            <TableHeader>{t("xsearch;Mode")}</TableHeader>
            <TableHeader>{t("freeagents;Weapon")}</TableHeader>
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default PlayerPage;
