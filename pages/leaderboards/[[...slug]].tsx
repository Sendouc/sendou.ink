import { Flex } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import ModeImage from "components/common/ModeImage";
import MyLink from "components/common/MyLink";
import NewTable from "components/common/NewTable";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import leaderboardsService, { Peak, PeakByWeapon } from "services/leaderboards";
import { weapons } from "utils/lists/weapons";

interface Props {
  placements: Peak | PeakByWeapon;
}

export const LeaderboardsPage = ({ placements }: Props) => {
  const router = useRouter();
  return (
    <>
      <Select
        maxW={64}
        mx="auto"
        mb={6}
        onChange={(e) => {
          router.push(leaderboardTypeToHref(e.target.value));
        }}
      >
        <option value="ALL">X Power - All</option>
        {weapons.map((wpn) => {
          return (
            <option key={wpn} value={wpn}>
              X Power - {wpn}
            </option>
          );
        })}
      </Select>
      <NewTable
        headers={[
          { name: "name", dataKey: "name" },
          { name: "x power", dataKey: "xPower" },
          { name: "weapon", dataKey: "weapon" },
          { name: "mode", dataKey: "mode" },
          { name: "month", dataKey: "month" },
        ]}
        data={placements.map((placement) => {
          return {
            id: placement.id,
            name: (
              <Flex align="center">
                {placement.player.user ? (
                  <MyLink href={`/u/${placement.player.user.discordId}`}>
                    <UserAvatar user={placement.player.user} size="xs" mr={1} />
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
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const getLeaderboard = slugToLeaderboardFunc(params?.slug);
  if (!getLeaderboard) return { notFound: true };

  const placements = await getLeaderboard();

  return {
    props: {
      placements,
    },
  };
};

function leaderboardTypeToHref(value: string) {
  switch (value) {
    case "ALL":
      return "/leaderboards";
    default:
      return `/leaderboards/${value}`;
  }
}

function slugToLeaderboardFunc(slug: string | string[] | undefined) {
  if (typeof slug === "string") return undefined;
  if (typeof slug === "object" && slug.length !== 1) return undefined;
  if (!slug) return leaderboardsService.peak;

  // weapon leaderboard
  return () => leaderboardsService.peakByWeapon(slug[0]);
}

export default LeaderboardsPage;
