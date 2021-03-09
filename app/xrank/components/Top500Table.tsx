import { Text } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/common/Table";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { useMyTheme } from "hooks/common";
import Link from "next/link";
import { getProfilePath, getRankingString } from "utils/strings";
import { Top500PlacementsByMonth } from "../service";

interface Props {
  placements: Top500PlacementsByMonth;
}

const Top500Table: React.FC<Props> = ({ placements }) => {
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
          {placements.map((placement) => {
            const user = placement.player.user;
            return (
              <TableRow key={placement.switchAccountId}>
                <TableCell color={gray}>
                  {getRankingString(placement.ranking)}
                </TableCell>
                <TableCell>
                  {user && (
                    <Link
                      href={getProfilePath({
                        discordId: user.discordId,
                        customUrlPath: user.profile?.customUrlPath,
                      })}
                    >
                      <a>
                        <UserAvatar user={user} isSmall mr="0.5rem" />
                      </a>
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <MyLink href={`/player/${placement.player.switchAccountId}`}>
                    {placement.playerName}
                  </MyLink>
                </TableCell>
                <TableCell>
                  <Text fontWeight="bold">{placement.xPower}</Text>
                </TableCell>
                <TableCell>
                  <WeaponImage name={placement.weapon} size={32} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default Top500Table;
