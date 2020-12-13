import { Flex, Text } from "@chakra-ui/react";
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
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { getRankingString } from "lib/strings";
import { useMyTheme } from "lib/useMyTheme";
import { GetPlayerWithPlacementsData } from "prisma/queries/getPlayerWithPlacements";

interface Props {
  player: NonNullable<GetPlayerWithPlacementsData>;
}

const TwinTable: React.FC<Props> = ({ player }) => {
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
            <Trans>Mate</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Mate's weapon</Trans>
          </TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {player.leaguePlacements.TWIN.map(({ squad }, index) => {
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
                <LeagueMate
                  mate={
                    squad.members.find(
                      (member) =>
                        member.player.switchAccountId !== player.switchAccountId
                    )!.player
                  }
                />
              </TableCell>
              <TableCell>
                <WeaponImage
                  name={
                    squad.members.find(
                      (member) =>
                        member.player.switchAccountId !== player.switchAccountId
                    )!.weapon
                  }
                  size={32}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

function LeagueMate({
  mate,
}: {
  mate: Player & {
    user: {
      username: string;
      discriminator: string;
      discordId: string;
      discordAvatar: string | null;
    } | null;
  };
}) {
  if (!mate.user && !mate.name) {
    return <MyLink href={`/player/${mate.switchAccountId}`}>{"???"}</MyLink>;
  }
  if (mate.user)
    return (
      <MyLink href={`/u/${mate.user.discordId}`}>
        <Flex alignItems="center">
          <UserAvatar user={mate.user} size="sm" mr={2} />
          {mate.user.username}
        </Flex>
      </MyLink>
    );

  return <MyLink href={`/player/${mate.switchAccountId}`}>{mate.name}</MyLink>;
}

export default TwinTable;
