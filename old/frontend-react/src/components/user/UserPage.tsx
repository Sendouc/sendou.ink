import { useQuery } from "@apollo/client";
import {
    Badge,
    Box,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs
} from "@chakra-ui/react";
import { Redirect, RouteComponentProps } from "@reach/router";
import React, { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { Trans, useTranslation } from "react-i18next";
import { FaTrophy, FaTshirt } from "react-icons/fa";
import { IconType } from "react-icons/lib/cjs";
import { useGetUsersXRankPlacementsQuery } from "../../generated/graphql";
import { SEARCH_FOR_BUILDS } from "../../graphql/queries/searchForBuilds";
import {
    SearchForUserData,
    SearchForUserVars,
    SEARCH_FOR_USER
} from "../../graphql/queries/searchForUser";
import { USER } from "../../graphql/queries/user";
import MyThemeContext from "../../themeContext";
import {
    SearchForBuildsData,
    SearchForBuildsVars,
    UserData
} from "../../types";
import { canAddJpnBuildsIds, weapons } from "../../utils/lists";
import Error from "../common/Error";
import Loading from "../common/Loading";
import Markdown from "../elements/Markdown";
import AvatarWithInfo from "./AvatarWithInfo";
import BuildTab from "./BuildTab";
import XRankTab from "./XRankTab";

interface TabI {
  id: number;
  icon: IconType;
  title: JSX.Element;
  content: JSX.Element;
}

interface UserPageProps {
  id?: string;
}

const UserPage: React.FC<RouteComponentProps & UserPageProps> = ({ id }) => {
  const { t } = useTranslation();
  const { data, error, loading } = useQuery<
    SearchForUserData,
    SearchForUserVars
  >(SEARCH_FOR_USER, {
    variables: isNaN(id as any) ? { custom_url: id } : { discord_id: id },
  });

  const { data: userData, error: userError, loading: userLoading } = useQuery<
    UserData
  >(USER);

  const {
    data: buildsData,
    error: buildsError,
    loading: buildsLoading,
  } = useQuery<SearchForBuildsData, SearchForBuildsVars>(SEARCH_FOR_BUILDS, {
    variables: { discord_id: data?.searchForUser?.discord_id as any },
    skip: !data || !data.searchForUser,
  });

  const {
    data: xRankPlacementsData,
    loading: xRankPlacementsLoading,
    error: xRankPlacementsError,
  } = useGetUsersXRankPlacementsQuery({
    skip: !data?.searchForUser?.discord_id,
    variables: {
      identifier: data?.searchForUser?.discord_id ?? "-1",
    },
  });

  const {
    textColor,
    themeColor,
    themeColorWithShade,
    grayWithShade,
  } = useContext(MyThemeContext);

  if (loading || userLoading || buildsLoading || xRankPlacementsLoading)
    return <Loading />;
  if (error) return <Error errorMessage={error.message} />;
  if (userError) return <Error errorMessage={userError.message} />;
  if (buildsError) return <Error errorMessage={buildsError.message} />;
  if (xRankPlacementsError)
    return <Error errorMessage={xRankPlacementsError.message} />;
  if (!data || !data.searchForUser || !userData || !buildsData)
    return <Redirect to="/404" />;

  const userLean = userData.user;
  const user = data.searchForUser;
  const builds = buildsData.searchForBuilds;

  const tabs: TabI[] = [];

  if (builds.length > 0 || userLean?.discord_id === user.discord_id) {
    tabs.push({
      id: 1,
      icon: FaTshirt,
      title: (
        <>
          {t("navigation;Builds")}{" "}
          <Badge colorScheme={themeColor} ml="0.5em">
            {builds.length}
          </Badge>
        </>
      ),
      content: (
        <TabPanel key={1}>
          <BuildTab
            builds={[...builds].sort((a, b) => {
              const weaponPool = user.weapons;
              if (weaponPool) {
                if (
                  weaponPool.includes(a.weapon) &&
                  weaponPool.includes(b.weapon)
                ) {
                  return (
                    weaponPool.indexOf(a.weapon) - weaponPool.indexOf(b.weapon)
                  );
                }
                const poolComparision =
                  weaponPool.indexOf(b.weapon) - weaponPool.indexOf(a.weapon);

                if (poolComparision !== 0) return poolComparision;
              }
              return weapons.indexOf(a.weapon) - weapons.indexOf(b.weapon);
            })}
            canModifyBuilds={userLean?.discord_id === user.discord_id}
            unlimitedBuilds={
              !!userData.user?.discord_id &&
              canAddJpnBuildsIds.includes(userData.user?.discord_id)
            }
          />
        </TabPanel>
      ),
    });
  }

  if (xRankPlacementsData?.getUserByIdentifier?.xRankPlacements) {
    tabs.push({
      id: 2,
      icon: FaTrophy,
      title: (
        <>
          {t("users;X Rank Top 500")}{" "}
          <Badge colorScheme={themeColor} ml="0.5em">
            {xRankPlacementsData.getUserByIdentifier.xRankPlacements.length}
          </Badge>
        </>
      ),
      content: (
        <TabPanel key={2}>
          <XRankTab placementsData={xRankPlacementsData} />
        </TabPanel>
      ),
    });
  } else if (userLean?.discord_id === user.discord_id) {
    tabs.push({
      id: 2,
      icon: FaTrophy,
      title: <>{t("users;X Rank Top 500")}</>,
      content: (
        <TabPanel key={2}>
          <Box color={grayWithShade}>
            <Trans i18nKey="users;noPlacementsPromptNew">
              If you have reached Top 500 in a <b>finished</b> X Rank season you
              can have it displayed here! Simply contact Sendou#0043 on Discord
              with your in-game name. Once set up new results are added
              automatically and no further action is needed.
            </Trans>
          </Box>
        </TabPanel>
      ),
    });
  }

  return (
    <>
      <Helmet>
        <title>
          {user.username}#{user.discriminator} | sendou.ink
        </title>
      </Helmet>
      <AvatarWithInfo
        user={user}
        canEdit={userLean?.discord_id === user.discord_id}
      />
      {user.bio && (
        <Box my="2em">
          <Markdown value={user.bio} />
        </Box>
      )}
      <Tabs isFitted variant="line" mt="2em" colorScheme={themeColor}>
        <TabList mb="1em">
          {tabs.map((tabObj) => (
            <Tab key={tabObj.id} color={textColor}>
              <Box
                as={tabObj.icon}
                size="24px"
                color={themeColorWithShade}
                mr="7px"
              />{" "}
              {tabObj.title}
            </Tab>
          ))}
        </TabList>
        <TabPanels>{tabs.map((tabObj) => tabObj.content)}</TabPanels>
      </Tabs>
    </>
  );
};

export default UserPage;
