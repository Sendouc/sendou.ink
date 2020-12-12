import { Box, Flex, Text } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Player } from "@prisma/client";
import MyLink from "components/common/MyLink";
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
  player: NonNullable<GetPlayerWithPlacementsData>;
}

const QuadTable: React.FC<Props> = ({ player }) => {
  const { i18n } = useLingui();
  const { gray } = useMyTheme();
  return (
    <Table maxW="50rem">
      <TableHead>
        <TableRow>
          <TableHeader />
          <TableHeader>
            <Trans>Date</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Power</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Weapon</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Mates</Trans>
          </TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {player.leaguePlacements.QUAD.map(({ squad }, index) => {
          return (
            <TableRow key={squad.id}>
              <TableCell color={gray}>{getRankingString(index + 1)}</TableCell>
              <TableCell>
                {new Date(squad.startTime).toLocaleString(i18n.locale, {
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell>
                <Text fontWeight="bold">{squad.leaguePower}</Text>
              </TableCell>
              <TableCell>
                <WeaponImage
                  name={
                    squad.members.find(
                      (member) =>
                        member.player.switchAccountId === player.switchAccountId
                    )!.weapon
                  }
                  size={32}
                />
              </TableCell>
              <TableCell>
                <LeagueMates
                  mates={squad.members.filter(
                    (member) =>
                      member.player.switchAccountId !== player.switchAccountId
                  )}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

function LeagueMates({
  mates,
}: {
  mates: {
    player: Player & {
      user: {
        username: string;
        discriminator: string;
        discordId: string;
        discordAvatar: string | null;
      } | null;
    };
    weapon: string;
  }[];
}) {
  return (
    <>
      {mates.map((mate) => (
        <Flex align="center" key={mate.player.switchAccountId}>
          <WeaponImage name={mate.weapon} size={32} />
          <Box ml={2}>
            <MyLink
              href={
                mate.player.user
                  ? `/u/${mate.player.user.discordId}`
                  : `/player/${mate.player.switchAccountId}`
              }
              prefetch={false}
            >
              {mate.player.name ?? "???"}
            </MyLink>
          </Box>
        </Flex>
      ))}
    </>
  );
}

export default QuadTable;
