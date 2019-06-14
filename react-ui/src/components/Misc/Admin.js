import React from 'react'
import { Icon, Header, Loader } from 'semantic-ui-react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { Redirect } from 'react-router-dom'

import { userLean } from '../../graphql/queries/userLean'

const Admin = () => {
  const { data, error, loading } = useQuery(userLean)

  if (loading) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }

  if (error) {
    return <div style={{"color": "red"}}>{error.message}</div>
  }

  const user = data.user

  if (!user || user.discord_id !== "79237403620945920") return <Redirect to='/404' />

  document.title = 'Admin - sendou.ink'
  return (
    <div>
      <Header>Add Twitter for a player</Header>
    </div>
  )
}

export default Admin