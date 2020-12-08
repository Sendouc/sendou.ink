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
import { getProfilePath, getRankingString } from "lib/strings";
import { useMyTheme } from "lib/useMyTheme";
import Link from "next/link";
import { GetTop500PlacementsByMonthData } from "prisma/queries/getTop500PlacementsByMonth";

interface Props {
  placements: GetTop500PlacementsByMonthData;
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
                  <MyLink
                    href={`/player/${placement.player.switchAccountId}`}
                    prefetch={false}
                  >
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
