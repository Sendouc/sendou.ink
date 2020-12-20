import { Button, Divider, HStack, Select } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Build, LeagueType, RankedMode } from "@prisma/client";
import BuildCard from "components/builds/BuildCard";
import Breadcrumbs from "components/common/Breadcrumbs";
import Markdown from "components/common/Markdown";
import MyContainer from "components/common/MyContainer";
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
import { getPlayersPeak } from "prisma/queries/getPlayersPeak";
import {
  getUserByIdentifier,
  GetUserByIdentifierData,
} from "prisma/queries/getUserByIdentifier";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiTShirtLine } from "react-icons/ri";
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

  const user = data ? data : props.user!;

  const { data: builds, weaponCounts, setWeapon, buildCount } = useBuildsByUser(
    user?.id,
    props.user?.profile?.weaponPool
  );

  const { i18n } = useLingui();

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
      <ProfileOwnersButtons />
      {user.profile?.bio && (
        <>
          <Divider my={6} />
          <MyContainer>
            <Markdown value={user.profile.bio} />
          </MyContainer>
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

  function ProfileOwnersButtons() {
    if (user && loggedInUser?.id === user.id) {
      return (
        <HStack spacing={4}>
          <Button
            leftIcon={<FiEdit />}
            variant="outline"
            onClick={() => setShowProfileModal(true)}
          >
            <Trans>Edit profile</Trans>
          </Button>
          {canPostBuilds() && (
            <Button
              leftIcon={<RiTShirtLine />}
              variant="outline"
              onClick={() => setBuildToEdit(true)}
            >
              <Trans>Add build</Trans>
            </Button>
          )}
        </HStack>
      );
    }

    return null;
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
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

  const peak = user.player?.switchAccountId
    ? await getPlayersPeak(user.player.switchAccountId)
    : { peakXPowers: {}, peakLeaguePowers: {} };

  return {
    props: {
      user,
      peakXPowers: peak.peakXPowers,
      peakLeaguePowers: peak.peakLeaguePowers,
    },
    revalidate: 1,
  };
};

export default ProfilePage;
