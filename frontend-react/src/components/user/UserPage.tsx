import React, { useState } from "react"
import { RouteComponentProps, Redirect } from "@reach/router"
import { useQuery } from "@apollo/react-hooks"

import { SEARCH_FOR_USER } from "../../graphql/queries/searchForUser"
import { USER } from "../../graphql/queries/user"
import Loading from "../common/Loading"
import Error from "../common/Error"
import {
  User,
  SearchForUserData,
  SearchForUserVars,
  UserData,
} from "../../types"
import AvatarWithInfo from "./AvatarWithInfo"
import WeaponPool from "./WeaponPool"
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/core"
import useTheme from "../../hooks/useTheme"

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

  const { themeColor } = useTheme()

  if (loading || userLoading) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  if (userError) return <Error errorMessage={userError.message} />
  if (!data || !data.searchForUser || !userData) return <Redirect to="/404" />

  const userLean = userData.user
  const user = data.searchForUser
  return (
    <>
      <AvatarWithInfo user={user} />
      {user.weapons && user.weapons.length > 0 && (
        <Box textAlign="center" mt="2em">
          <WeaponPool weapons={user.weapons} />
        </Box>
      )}
      <Tabs isFitted variant="soft-rounded" mt="2em" variantColor={themeColor}>
        <TabList mb="1em">
          <Tab>Builds</Tab>
          <Tab>X Rank Top 500</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <p>one!</p>
          </TabPanel>
          <TabPanel>
            <p>two!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}

export default UserPage
