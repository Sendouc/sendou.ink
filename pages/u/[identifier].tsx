import { Button, Divider, HStack, Select } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Build, LeagueType, RankedMode } from "@prisma/client";
import BuildCard from "components/builds/BuildCard";
import Markdown from "components/common/Markdown";
import MyInfiniteScroller from "components/common/MyInfiniteScroller";
import AvatarWithInfo from "components/u/AvatarWithInfo";
import Badges from "components/u/Badges";
import BuildModal from "components/u/BuildModal";
import ProfileModal from "components/u/ProfileModal";
import { useUser } from "hooks/common";
import { useBuildsByUser } from "hooks/u";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { getPlayersPeak } from "prisma/queries/getPlayersPeak";
import {
  getUserByIdentifier,
  GetUserByIdentifierData,
} from "prisma/queries/getUserByIdentifier";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiTShirtLine } from "react-icons/ri";
import useSWR from "swr";
import { GANBA_DISCORD_ID } from "utils/constants";
import { isCustomUrl } from "utils/validators/profile";
import MyHead from "../../components/common/MyHead";

interface Props {
  user: GetUserByIdentifierData;
  peakXPowers: Partial<Record<RankedMode, number>>;
  peakLeaguePowers: Partial<Record<LeagueType, number>>;
}

const ProfilePage = (props: Props) => {
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [buildToEdit, setBuildToEdit] = useState<boolean | Build>(false);
  const [userId, setUserId] = useState<number | undefined>(undefined);

  const apiUrl = () => {
    if (userId || (!!props.user?.id && props.user.id === loggedInUser?.id)) {
      return `/api/users/${userId}`;
    }

    return null;
  };

  const [loggedInUser] = useUser();
  const { data } = useSWR<GetUserByIdentifierData>(apiUrl(), {
    initialData: props.user,
  });

  const user = data ? data : props.user!;

  const {
    data: builds,
    weaponCounts,
    setWeapon,
    buildCount,
  } = useBuildsByUser(user?.id, props.user?.profile?.weaponPool);

  const { i18n } = useLingui();

  const canPostBuilds = (() => {
    if (loggedInUser?.id !== user.id) return false;
    if (buildCount >= 100 && user.discordId !== GANBA_DISCORD_ID) return false;

    return true;
  })();

  useEffect(() => {
    if (!router.query.build || !canPostBuilds) return;

    setBuildToEdit(true);
  }, [router.query.build, canPostBuilds]);

  useEffect(() => {
    const identifier = window.location.pathname.split("/")[2];
    if (isCustomUrl(identifier) || !user.profile?.customUrlPath) return;
    history.replaceState({}, "", `/u/${user.profile.customUrlPath}`);
  }, [user.profile?.customUrlPath]);

  useEffect(() => {
    setUserId(props.user.id);
  }, [props.user.id]);

  return (
    <>
      <MyHead title={user.username} />
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} user={user} />
      )}
      {buildToEdit && (
        <BuildModal
          onClose={() => setBuildToEdit(false)}
          build={typeof buildToEdit === "boolean" ? undefined : buildToEdit}
          weaponFromQuery={
            typeof router.query.build === "string"
              ? router.query.build
              : undefined
          }
        />
      )}

      <AvatarWithInfo
        user={user}
        peakXPowers={props.peakXPowers}
        peakLeaguePowers={props.peakLeaguePowers}
      />
      <Badges
        userId={props.user.id}
        userDiscordId={props.user.discordId}
        patreonTier={user.patreonTier}
        peakXP={
          Object.values(props.peakXPowers).sort(
            (a, b) => (b ?? -1) - (a ?? -1)
          )[0]
        }
      />
      <ProfileOwnersButtons />
      {user.profile?.bio && user.profile?.bio.trim().length > 0 && (
        <>
          <Divider my={6} />
          <Markdown value={user.profile.bio} smallHeaders />
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
              maxWidth={64}
              size="sm"
              rounded="lg"
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
            size="sm"
          >
            <Trans>Edit profile</Trans>
          </Button>
          {canPostBuilds && (
            <Button
              leftIcon={<RiTShirtLine />}
              variant="outline"
              onClick={() => setBuildToEdit(true)}
              size="sm"
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
  try {
    const user = await getUserByIdentifier(params!.identifier as string);

    const peak = user!.player?.switchAccountId
      ? await getPlayersPeak(user!.player.switchAccountId)
      : { peakXPowers: {}, peakLeaguePowers: {} };

    return {
      props: {
        user,
        peakXPowers: peak.peakXPowers,
        peakLeaguePowers: peak.peakLeaguePowers,
      },
      revalidate: 1,
    };
  } catch (e) {
    return { notFound: true };
  }
};

export default ProfilePage;
