import { Button, Divider, Select } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { RankedMode } from "@prisma/client";
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
import DBClient from "prisma/client";
import { getPlayersTop500Placements } from "prisma/queries/getPlayersTop500Placements";
import {
  getUserByIdentifier,
  GetUserByIdentifierData,
} from "prisma/queries/getUserByIdentifier";
import { useState } from "react";
import useSWR from "swr";

const prisma = DBClient.getInstance().prisma;

interface Props {
  user: GetUserByIdentifierData;
  peakXPowers: Partial<Record<RankedMode, number>>;
}

const ProfilePage = (props: Props) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);

  const [loggedInUser] = useUser();
  const { data: user } = useSWR<GetUserByIdentifierData>(
    !!props.user?.id && props.user.id === loggedInUser?.id
      ? `/api/users/${props.user.id}`
      : null,
    { initialData: props.user }
  );
  const { data: builds, weaponCounts, setWeapon, buildCount } = useBuildsByUser(
    user?.id
  );

  const { i18n } = useLingui();

  // same as router.isFallback
  // FIXME: return spinner
  if (!user) return null;

  const canPostBuilds = () => {
    if (loggedInUser?.id !== user.id) return false;
    if (buildCount >= 100 && user.discordId !== GANBA_DISCORD_ID) return false;

    return true;
  };

  return (
    <>
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} user={user} />
      )}
      {showBuildModal && (
        <BuildModal onClose={() => setShowBuildModal(false)} />
      )}

      <Breadcrumbs
        pages={[
          { name: t`Users`, link: "/u" },
          { name: getFullUsername(user) },
        ]}
      />
      <AvatarWithInfo user={user} peakXPowers={props.peakXPowers} />
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
            <Button mt={5} onClick={() => setShowBuildModal(true)}>
              <Trans>Add build</Trans>
            </Button>
          )}
          <MyInfiniteScroller>
            {builds.map((build) => (
              <BuildCard key={build.id} build={build} m={2} showWeapon />
            ))}
          </MyInfiniteScroller>
        </>
      )}
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const users = await prisma.user.findMany({ include: { profile: true } });
  return {
    paths: users.flatMap((u) =>
      u.profile?.customUrlPath
        ? [
            { params: { identifier: u.discordId } },
            { params: { identifier: u.profile.customUrlPath } },
          ]
        : { params: { identifier: u.discordId } }
    ),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const user = await getUserByIdentifier(params!.identifier as string);

  const peakXPowers: Partial<Record<RankedMode, number>> = {};

  if (!!user?.player?.switchAccountId) {
    const placements = await getPlayersTop500Placements(
      user.player.switchAccountId
    );

    for (const placement of placements) {
      peakXPowers[placement.mode] = Math.max(
        peakXPowers[placement.mode] ?? 0,
        placement.xPower
      );
    }
  }

  if (!user) return { notFound: true };

  return {
    props: {
      user,
      peakXPowers,
    },
    revalidate: 1,
    redirect: getRedirect(
      params!.identifier as string,
      user?.profile?.customUrlPath
    ),
  };
};

function getRedirect(
  identifier: string,
  customUrlPath?: string | null
): { destination: string } | undefined {
  if (isCustomUrl(identifier)) return undefined;
  if (!customUrlPath) return undefined;

  return { destination: `/u/${customUrlPath}` };
}

export default ProfilePage;
