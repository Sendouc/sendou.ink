import { Button, Divider, Select } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { RankedMode } from "@prisma/client";
import BuildCard from "components/builds/BuildCard";
import Breadcrumbs from "components/common/Breadcrumbs";
import Markdown from "components/common/Markdown";
import MyInfiniteScroller from "components/common/MyInfiniteScroller";
import AvatarWithInfo from "components/u/AvatarWithInfo";
import ProfileModal from "components/u/ProfileModal";
import { useBuildsByUser } from "hooks/u";
import { getFullUsername } from "lib/strings";
import useUser from "lib/useUser";
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

// FIXME: should try to make it so that /u/Sendou and /u/234234298348 point to the same page
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

interface Props {
  user: GetUserByIdentifierData;
  peakXPowers: Partial<Record<RankedMode, number>>;
}

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

  // FIXME: redirect
  //const isCustomUrl = isNaN(Number(params!.identifier))

  return {
    props: {
      user,
      peakXPowers,
    },
    revalidate: 1,
    notFound: !user,
    //redirect: isCustomUrl ? { destination: "" } : undefined,
  };
};

const ProfilePage = (props: Props) => {
  const [showModal, setShowModal] = useState(false);

  const [loggedInUser] = useUser();
  const { data: user } = useSWR<GetUserByIdentifierData>(
    () => {
      // no need to load user if it's not the same as currently logged in user
      const userId = props.user?.id;
      if (!!userId && userId === loggedInUser?.id) return null;

      return `/api/users/${userId}`;
    },
    { initialData: props.user }
  );
  const { data: builds, weaponCounts, setWeapon, buildCount } = useBuildsByUser(
    user?.id
  );

  // same as router.isFallback
  // FIXME: return spinner
  if (!user) return null;

  return (
    <>
      <Breadcrumbs
        pages={[
          { name: t`Users`, link: "/u" },
          { name: getFullUsername(user) },
        ]}
      />
      <AvatarWithInfo user={user} peakXPowers={props.peakXPowers} />
      {loggedInUser?.id === user.id && (
        <Button onClick={() => setShowModal(true)}>
          <Trans>Edit profile</Trans>
        </Button>
      )}
      {showModal && (
        <ProfileModal onClose={() => setShowModal(false)} user={user} />
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
              <option value="ALL">All weapons ({buildCount})</option>
              {weaponCounts.map((wpnTuple) => (
                <option value={wpnTuple[0]}>
                  {wpnTuple[0]} ({wpnTuple[1]})
                </option>
              ))}
            </Select>
          )}
          <MyInfiniteScroller>
            {builds.map((build) => (
              <BuildCard key={build.id} build={build} m={2} />
            ))}
          </MyInfiniteScroller>
        </>
      )}
    </>
  );
};

export default ProfilePage;
