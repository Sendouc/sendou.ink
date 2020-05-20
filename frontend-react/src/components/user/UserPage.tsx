import React, { useContext } from "react"
import { RouteComponentProps, Redirect } from "@reach/router"
import { useQuery } from "@apollo/react-hooks"

import {
  SEARCH_FOR_USER,
  SearchForUserData,
  SearchForUserVars,
} from "../../graphql/queries/searchForUser"
import { USER } from "../../graphql/queries/user"
import Loading from "../common/Loading"
import Error from "../common/Error"
import {
  UserData,
  SearchForBuildsData,
  SearchForBuildsVars,
  PlayerInfoData,
  PlayerInfoVars,
} from "../../types"
import { FaTshirt, FaTrophy } from "react-icons/fa"
import { IconType } from "react-icons/lib/cjs"
import AvatarWithInfo from "./AvatarWithInfo"
import WeaponPool from "./WeaponPool"
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
} from "@chakra-ui/core"
import { Helmet } from "react-helmet-async"
import { SEARCH_FOR_BUILDS } from "../../graphql/queries/searchForBuilds"
import BuildTab from "./BuildTab"
import MyThemeContext from "../../themeContext"
import { PLAYER_INFO } from "../../graphql/queries/playerInfo"
import XRankTab from "./XRankTab"
import { weapons } from "../../utils/lists"
import Alert from "../elements/Alert"
import Markdown from "../elements/Markdown"
import SubHeader from "../common/SubHeader"

interface Tab {
  id: number
  icon: IconType
  title: JSX.Element
  content: JSX.Element
}

interface UserPageProps {
  id?: string
}

const UserPage: React.FC<RouteComponentProps & UserPageProps> = ({ id }) => {
  const { data, error, loading } = useQuery<
    SearchForUserData,
    SearchForUserVars
  >(SEARCH_FOR_USER, {
    variables: isNaN(id as any) ? { custom_url: id } : { discord_id: id },
  })

  const { data: userData, error: userError, loading: userLoading } = useQuery<
    UserData
  >(USER)

  const {
    data: buildsData,
    error: buildsError,
    loading: buildsLoading,
  } = useQuery<SearchForBuildsData, SearchForBuildsVars>(SEARCH_FOR_BUILDS, {
    variables: { discord_id: data?.searchForUser?.discord_id as any },
    skip: !data || !data.searchForUser,
  })

  const {
    data: playerData,
    error: playerError,
    loading: playerLoading,
  } = useQuery<PlayerInfoData, PlayerInfoVars>(PLAYER_INFO, {
    variables: { twitter: data?.searchForUser?.twitter_name as any },
    skip: !data || !data.searchForUser || !data.searchForUser.twitter_name,
  })

  const { textColor, themeColor, themeColorWithShade } = useContext(
    MyThemeContext
  )

  if (loading || userLoading || buildsLoading || playerLoading)
    return <Loading />
  if (error) return <Error errorMessage={error.message} />
  if (userError) return <Error errorMessage={userError.message} />
  if (buildsError) return <Error errorMessage={buildsError.message} />
  if (playerError) return <Error errorMessage={playerError.message} />
  if (!data || !data.searchForUser || !userData || !buildsData)
    return <Redirect to="/404" />

  const userLean = userData.user
  const user = data.searchForUser
  const builds = buildsData.searchForBuilds

  const tabs: Tab[] = []

  if (builds.length > 0 || userLean?.discord_id === user.discord_id) {
    tabs.push({
      id: 1,
      icon: FaTshirt,
      title: (
        <>
          Builds{" "}
          <Badge variantColor={themeColor} ml="0.5em">
            {builds.length}
          </Badge>
        </>
      ),
      content: (
        <TabPanel key={1}>
          <BuildTab
            builds={builds.sort(
              (a, b) => weapons.indexOf(a.weapon) - weapons.indexOf(b.weapon)
            )}
            canModifyBuilds={userLean?.discord_id === user.discord_id}
          />
        </TabPanel>
      ),
    })
  }

  if (playerData?.playerInfo?.placements) {
    tabs.push({
      id: 2,
      icon: FaTrophy,
      title: (
        <>
          X Rank Top 500{" "}
          <Badge variantColor={themeColor} ml="0.5em">
            {playerData.playerInfo.placements.length}
          </Badge>
        </>
      ),
      content: (
        <TabPanel key={2}>
          <XRankTab placements={playerData.playerInfo.placements} />
        </TabPanel>
      ),
    })
  } else if (userLean?.discord_id === user.discord_id) {
    tabs.push({
      id: 2,
      icon: FaTrophy,
      title: <>X Rank Top 500</>,
      content: (
        <TabPanel key={2}>
          <Alert status="info">
            If you have reached Top 500 in a finished X Rank season you can have
            it displayed here! Just contact Sendou#0043 on Discord with your
            in-game nick.
          </Alert>
        </TabPanel>
      ),
    })
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
      {user.weapons && user.weapons.length > 0 && (
        <Box textAlign="center" mt="1em">
          <WeaponPool weapons={user.weapons} />
        </Box>
      )}
      {user.bio && (
        <Box my="1em">
          <SubHeader>Bio</SubHeader>
          <Markdown value={user.bio} />
        </Box>
      )}
      <Tabs isFitted variant="line" mt="2em" variantColor={themeColor}>
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
  )
}

export default UserPage
