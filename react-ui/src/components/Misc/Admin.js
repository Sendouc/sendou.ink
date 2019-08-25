import React, { useState } from 'react'
import { Input, Header, Loader, Button } from 'semantic-ui-react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Redirect } from 'react-router-dom'

import { userLean } from '../../graphql/queries/userLean'
import { updateTwitter } from '../../graphql/mutations/updateTwitter'

const Admin = () => {
  const { data, error, loading } = useQuery(userLean)
  const [uid, setUid] = useState('')
  const [twitter, setTwitter] = useState('')

  const [updateTwitterMutation] = useMutation(updateTwitter)

  const handleUidTwitter = async (e) => {
    e.preventDefault()

    await updateTwitterMutation({
      variables: { unique_id: uid, twitter }
    })

    setUid('')
    setTwitter('')
  } 

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
      Enter unique id: <Input value={uid} onChange={(event) => setUid(event.target.value)}/>
      Enter Twitter <Input value={twitter} onChange={(event) => setTwitter(event.target.value)}/>
      <Button onClick={handleUidTwitter}>Submit</Button>
    </div>
  )
}

export default Admin