import { LeagueType, Region } from ".prisma/client";
import { Select } from "@chakra-ui/select";
import LeaderboardTable from "components/leaderboards/LeaderboardTable";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import leaderboardsService, {
  Peak,
  PeakByWeapon,
  PeakLeague,
} from "services/leaderboards";
import { weapons } from "utils/lists/weapons";

export type LeaderboardsPageProps =
  | {
      placements: Peak | PeakByWeapon;
      type: "XPOWER_PEAK";
    }
  | {
      placements: PeakLeague;
      type: "LEAGUE";
    };

export const LeaderboardsPage = (props: LeaderboardsPageProps) => {
  const router = useRouter();

  console.log(router.asPath);

  const dropdownValue =
    router.asPath.replace("/leaderboards", "").length === 0
      ? "ALL"
      : router.asPath.split("/")[2];

  return (
    <>
      <Select
        maxW={64}
        mx="auto"
        mb={6}
        value={dropdownValue}
        onChange={(e) => {
          router.push(leaderboardTypeToHref(e.target.value));
        }}
      >
        <option value="LEAGUE-TWIN-EU">Twin league (EU)</option>
        <option value="LEAGUE-TWIN-NA">Twin league (NA)</option>
        <option value="LEAGUE-TWIN-JP">Twin league (JP)</option>
        <option value="LEAGUE-QUAD-EU">Quad league (EU)</option>
        <option value="LEAGUE-QUAD-NA">Quad league (NA)</option>
        <option value="LEAGUE-QUAD-JP">Quad league (JP)</option>
        <option value="ALL">X Power - All</option>
        {weapons.map((wpn) => {
          return (
            <option key={wpn} value={wpn}>
              X Power - {wpn}
            </option>
          );
        })}
      </Select>
      <LeaderboardTable {...props} />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<LeaderboardsPageProps> = async ({
  params,
}) => {
  const slug = params?.slug;
  if (
    typeof slug === "string" ||
    (typeof slug === "object" && slug.length !== 1)
  )
    return { notFound: true };

  if (!slug) {
    return {
      props: {
        type: "XPOWER_PEAK",
        placements: await leaderboardsService.peak(),
      },
    };
  }

  if (/^(LEAGUE)-(TWIN|QUAD)-(EU|NA|JP)$/.test(slug[0])) {
    const [, type, region] = slug[0].split("-");

    return {
      props: {
        type: "LEAGUE",
        placements: JSON.parse(
          JSON.stringify(
            await leaderboardsService.peakLeague({
              type: type as LeagueType,
              region: region as Region,
            })
          )
        ),
      },
    };
  }

  // weapon leaderboard
  // TODO validate weapon
  return {
    props: {
      type: "XPOWER_PEAK",
      placements: await leaderboardsService.peakByWeapon(slug[0]),
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

export default LeaderboardsPage;
