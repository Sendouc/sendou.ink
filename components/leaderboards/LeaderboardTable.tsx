import { Flex } from "@chakra-ui/layout";
import ModeImage from "components/common/ModeImage";
import MyLink from "components/common/MyLink";
import NewTable from "components/common/NewTable";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { LeaderboardsPageProps } from "pages/leaderboards/[[...slug]]";
import React from "react";

const LeaderboardTable = (props: LeaderboardsPageProps) => {
  switch (props.type) {
    case "LEAGUE":
      const addToHeaders =
        props.placements[0].members.length === 4
          ? [
              { name: "member 3", dataKey: "member3" },
              { name: "member 4", dataKey: "member4" },
            ]
          : [];
      return (
        <NewTable
          smallAtPx="800"
          headers={[
            { name: "power", dataKey: "leaguePower" },
            { name: "time", dataKey: "time" },
            { name: "member 1", dataKey: "member1" },
            { name: "member 2", dataKey: "member2" },
            ...addToHeaders,
            { name: "weapons", dataKey: "weapons" },
          ]}
          data={props.placements.map((placement) => {
            const members = placement.members.reduce(
              (acc: Record<string, React.ReactNode>, member, i) => {
                const name =
                  member.player.user?.username ?? member.player.name ?? "???";
                acc[`member${i + 1}`] = (
                  <Flex align="center" wordBreak="break-all" maxW={36}>
                    {member.player.user ? (
                      <MyLink href={`/u/${member.player.user.discordId}`}>
                        <UserAvatar
                          user={member.player.user}
                          size="xs"
                          mr={1}
                        />
                      </MyLink>
                    ) : null}
                    <MyLink
                      href={`/player/${member.switchAccountId}`}
                      isColored={false}
                    >
                      {name}
                    </MyLink>
                  </Flex>
                );

                return acc;
              },
              {}
            );
            return {
              id: placement.id,
              leaguePower: placement.leaguePower,
              time: new Date(placement.startTime).toLocaleString("en", {
                month: "numeric",
                year: "2-digit",
                hour: "numeric",
                day: "numeric",
              }),
              weapons: (
                <Flex align="center" flexWrap="wrap">
                  {placement.members.map((member) => (
                    <WeaponImage
                      key={member.switchAccountId}
                      name={member.weapon}
                      size={32}
                    />
                  ))}
                </Flex>
              ),
              ...members,
            };
          })}
        />
      );
    case "XPOWER_PEAK":
      return (
        <NewTable
          isLeaderboard
          headers={[
            { name: "name", dataKey: "name" },
            { name: "x power", dataKey: "xPower" },
            { name: "weapon", dataKey: "weapon" },
            { name: "mode", dataKey: "mode" },
            { name: "month", dataKey: "month" },
          ]}
          data={props.placements.map((placement) => {
            return {
              id: placement.id,
              name: (
                <Flex align="center">
                  {placement.player.user ? (
                    <MyLink href={`/u/${placement.player.user.discordId}`}>
                      <UserAvatar
                        user={placement.player.user}
                        size="xs"
                        mr={1}
                      />
                    </MyLink>
                  ) : null}
                  <MyLink
                    href={`/player/${placement.switchAccountId}`}
                    isColored={false}
                  >
                    {placement.playerName}
                  </MyLink>
                </Flex>
              ),
              xPower: placement.xPower,
              weapon: <WeaponImage name={placement.weapon} size={32} />,
              mode: <ModeImage mode={placement.mode} size={32} />,
              month: `${placement.month}/${placement.year}`,
            };
          })}
        />
      );
    default:
      throw Error("invalid leaderboard type");
  }
};

export default LeaderboardTable;
