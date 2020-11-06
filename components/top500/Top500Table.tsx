import { Avatar, Text } from "@chakra-ui/core";
import { Trans } from "@lingui/macro";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/Table";
import WeaponImage from "components/WeaponImage";
import {
  getDiscordAvatarUrl,
  getFullUsername,
  getProfilePath,
  getRankingString,
} from "lib/strings";
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
                        <Avatar
                          src={getDiscordAvatarUrl({
                            discordId: user.discordId,
                            discordAvatar: user.discordAvatar,
                          })}
                          size="sm"
                          name={getFullUsername(user)}
                          mr="0.5rem"
                        />
                      </a>
                    </Link>
                  )}
                </TableCell>
                <TableCell>{placement.playerName}</TableCell>
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
