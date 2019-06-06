import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { Button, Loader, Message } from 'semantic-ui-react'

import { addBuild } from '../../graphql/mutations/addBuild'
import { searchForBuilds } from '../../graphql/queries/searchForBuilds'
import BuildForm from './BuildForm'
import Build from './Build'

const BuildTab = ({ user, userViewed }) => {
  const { data, error, loading } = useQuery(searchForBuilds, {variables: { discord_id: userViewed.discord_id }})
  const [ errorMsg, setErrorMsg ] = useState(null)
  const [ successMsg, setSuccessMsg ] = useState(false)
  const [ showForm, setShowForm ] = useState(false)

  const handleError = (error) => {
    errorMsg(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMsg(null)
    }, 10000)
  }

  const addBuildMutation = useMutation(addBuild, {
    onError: handleError,
    refetchQueries: [{ query: searchForBuilds, variables: { discord_id: userViewed.discord_id }} ]
  })

  if (loading) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }

  if (error) {
    return <div style={{"color": "red"}}>{error.message}</div>
  }

  return (
    <div>
      {successMsg ?
        <div style={{"paddingBottom": "10px"}}>
          <Message
            success
            content='Adding the new build was succesful'
          />
        </div> : null}
      <div>
        {data.searchForBuilds.length >= 20 && user && user.discord_id === userViewed.discord_id ? 'Looks like you have 20 buids. Insane flex. Delete a build before adding a new one.' : null}
        {!user || user.discord_id !== userViewed.discord_id || data.searchForBuilds.length >= 20 ? 
            null : 
            <Button circular size='tiny' icon={showForm ? 'minus' : 'plus'} onClick={ () => setShowForm(!showForm) }
        />}
        {showForm ? <div style={{"paddingTop": "10px"}}><BuildForm addBuild={addBuildMutation} setShowForm={setShowForm} setSuccessMsg={setSuccessMsg}/></div> : null}
      </div>
      <div style={{"paddingTop": "10px"}}>
        {data.searchForBuilds.map(b => <div key={b.id} style={{"paddingTop": "10px"}}><Build build={b}/></div>)}
        {data.searchForBuilds.length === 0 ? 'So far this user has no builds!' : null}
      </div>
    </div>
  )
}

export default BuildTab