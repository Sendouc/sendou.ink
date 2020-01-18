import React from "react"
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
import { Box } from "@chakra-ui/core"

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
    </>
  )
}

export default UserPage
