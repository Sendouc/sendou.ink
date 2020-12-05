import { Button, Divider, Select } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Build, LeagueType, RankedMode } from "@prisma/client";
import BuildCard from "components/builds/BuildCard";
import Breadcrumbs from "components/common/Breadcrumbs";
import Markdown from "components/common/Markdown";
import MyInfiniteScroller from "components/common/MyInfiniteScroller";
import AvatarWithInfo from "components/u/AvatarWithInfo";
import BuildModal from "components/u/BuildModal";
import ProfileModal from "components/u/ProfileModal";
import { useBuildsByUser } from "hooks/u";
import { GANBA_DISCORD_ID } from "lib/constants";
import { getFullUsername } from "lib/strings";
import useUser from "lib/useUser";
import { isCustomUrl } from "lib/validators/profile";
import { GetStaticPaths, GetStaticProps } from "next";
import prisma from "prisma/client";
import { getPlayersTop500Placements } from "prisma/queries/getPlayersTop500Placements";
import {
  getUserByIdentifier,
  GetUserByIdentifierData,
} from "prisma/queries/getUserByIdentifier";
import { useState } from "react";
import useSWR from "swr";

interface Props {
  user: GetUserByIdentifierData;
  peakXPowers: Partial<Record<RankedMode, number>>;
  peakLeaguePowers: Partial<Record<LeagueType, number>>;
}

const ProfilePage = (props: Props) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [buildToEdit, setBuildToEdit] = useState<boolean | Build>(false);

  const [loggedInUser] = useUser();
  const { data } = useSWR<GetUserByIdentifierData>(
    !!props.user?.id && props.user.id === loggedInUser?.id
      ? `/api/users/${props.user.id}`
      : null,
    { initialData: props.user }
  );

  const user = data ? data : props.user;

  const { data: builds, weaponCounts, setWeapon, buildCount } = useBuildsByUser(
    user?.id
  );

  const { i18n } = useLingui();

  // same as router.isFallback
  // TODO: return spinner
  if (!user) return null;

  const canPostBuilds = () => {
    if (loggedInUser?.id !== user.id) return false;
    if (buildCount >= 100 && user.discordId !== GANBA_DISCORD_ID) return false;

    return true;
  };

  console.log({ props });

  return (
    <>
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} user={user} />
      )}
      {buildToEdit && (
        <BuildModal
          onClose={() => setBuildToEdit(false)}
          build={typeof buildToEdit === "boolean" ? undefined : buildToEdit}
        />
      )}

      <Breadcrumbs
        pages={[
          { name: t`Users`, link: "/u" },
          { name: getFullUsername(user) },
        ]}
      />
      <AvatarWithInfo
        user={user}
        peakXPowers={props.peakXPowers}
        peakLeaguePowers={props.peakLeaguePowers}
      />
      {loggedInUser?.id === user.id && (
        <Button onClick={() => setShowProfileModal(true)}>
          <Trans>Edit profile</Trans>
        </Button>
      )}
      {user.profile?.bio && (
        <>
          <Divider my={6} />
          <Markdown value={user.profile.bio} />
        </>
      )}
      {buildCount > 0 && (
        <>
          <Divider my={6} />
          {buildCount > 6 && (
            <Select
              onChange={(e) =>
                setWeapon(e.target.value === "ALL" ? null : e.target.value)
              }
              mx="auto"
              maxWidth={80}
              size="lg"
            >
              <option value="ALL">
                {t`All weapons`} ({buildCount})
              </option>
              {weaponCounts.map(([weapon, count]) => (
                <option key={weapon} value={weapon}>
                  {i18n._(weapon)} ({count})
                </option>
              ))}
            </Select>
          )}
          {canPostBuilds() && (
            <Button mt={5} onClick={() => setBuildToEdit(true)}>
              <Trans>Add build</Trans>
            </Button>
          )}
          <MyInfiniteScroller>
            {builds.map((build) => (
              <BuildCard
                key={build.id}
                build={build}
                m={2}
                showWeapon
                onEdit={
                  loggedInUser?.id === user.id
                    ? (build) => setBuildToEdit(build)
                    : undefined
                }
              />
            ))}
          </MyInfiniteScroller>
        </>
      )}
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const users = await prisma.user.findMany({
    where: { NOT: [{ profile: { customUrlPath: null } }] },
    include: { profile: true },
  });
  return {
    paths: users.map((u) => ({
      params: { identifier: u.profile?.customUrlPath ?? u.discordId },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const user = await getUserByIdentifier(params!.identifier as string);

  if (!user) return { notFound: true };
  if (
    user.profile?.customUrlPath &&
    !isCustomUrl(params!.identifier as string)
  ) {
    return {
      redirect: {
        destination: `/u/${user.profile.customUrlPath}`,
        permanent: true,
      },
    };
  }

  const peakXPowers: Partial<Record<RankedMode, number>> = {};
  let peakLeaguePowers: Partial<Record<LeagueType, number>> = {};

  if (!!user.player?.switchAccountId) {
    const player = await getPlayersTop500Placements(
      user.player.switchAccountId
    );

    for (const placement of player!.placements) {
      peakXPowers[placement.mode] = Math.max(
        peakXPowers[placement.mode] ?? 0,
        placement.xPower
      );
    }

    peakLeaguePowers = player!.leaguePlacements.reduce(
      (acc, cur) => {
        acc[cur.squad.type] = Math.max(
          acc[cur.squad.type],
          cur.squad.leaguePower
        );
        return acc;
      },
      { TWIN: -1, QUAD: -1 }
    );
  }

  return {
    props: {
      user,
      peakXPowers,
      peakLeaguePowers,
    },
    revalidate: 1,
  };
};

export default ProfilePage;
