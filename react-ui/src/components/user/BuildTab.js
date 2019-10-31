import React, { useState } from "react"
import { useQuery, useMutation } from "@apollo/react-hooks"
import { Button, Message } from "semantic-ui-react"

import { addBuild } from "../../graphql/mutations/addBuild"
import { searchForBuilds } from "../../graphql/queries/searchForBuilds"
import { deleteBuild } from "../../graphql/mutations/deleteBuild"
import { updateBuild } from "../../graphql/mutations/updateBuild"
import AddBuildForm from "./AddBuildForm"
import BuildCard from "../common/BuildCard"
import Loading from "../common/Loading"
import Error from "../common/Error"

const BuildTab = ({ user, userViewed }) => {
  const { data, error, loading } = useQuery(searchForBuilds, {
    variables: { discord_id: userViewed.discord_id }
  })
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleError = error => {
    errorMsg(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMsg(null)
    }, 10000)
  }

  const [addBuildMutation] = useMutation(addBuild, {
    onError: handleError,
    refetchQueries: [
      {
        query: searchForBuilds,
        variables: { discord_id: userViewed.discord_id }
      }
    ]
  })

  const [deleteBuildMutation] = useMutation(deleteBuild, {
    onError: handleError,
    refetchQueries: [
      {
        query: searchForBuilds,
        variables: { discord_id: userViewed.discord_id }
      }
    ]
  })

  const [editBuildMutation] = useMutation(updateBuild, {
    onError: handleError,
    refetchQueries: [
      {
        query: searchForBuilds,
        variables: { discord_id: userViewed.discord_id }
      }
    ]
  })

  const deleteBuildById = async ({ id, title, weapon }) => {
    await deleteBuildMutation({
      variables: { id }
    })

    const buildTitle = title ? title : `${weapon} build`

    setSuccessMsg(`Successfully deleted ${buildTitle}`)
    setTimeout(() => {
      setSuccessMsg(null)
    }, 10000)
  }

  const editBuildById = async build => {
    await editBuildMutation({
      variables: { ...build }
    })

    setSuccessMsg("Build successfully edited")
    setTimeout(() => {
      setSuccessMsg(null)
    }, 10000)
  }

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  const removeBuildFunction =
    user && user.discord_id === userViewed.discord_id ? deleteBuildById : null
  const editBuildFunction =
    user && user.discord_id === userViewed.discord_id ? editBuildById : null

  return (
    <div>
      {successMsg ? (
        <div style={{ paddingBottom: "10px" }}>
          <Message success content={successMsg} />
        </div>
      ) : null}
      <div>
        {data.searchForBuilds.length >= 100 &&
        user &&
        user.discord_id === userViewed.discord_id
          ? "Looks like you have 100 buids. Insane flex. Delete a build before adding a new one."
          : null}
        {/*TODO: put this back the right way */}
        {!user ||
        user.discord_id !== userViewed.discord_id ||
        data.searchForBuilds.length >= 100 ? (
          <Button
            circular
            size="tiny"
            icon={showForm ? "minus" : "plus"}
            onClick={() => setShowForm(!showForm)}
          />
        ) : null}
        {showForm ? (
          <div style={{ paddingTop: "10px" }}>
            <AddBuildForm
              addBuild={addBuildMutation}
              setShowForm={setShowForm}
              setSuccessMsg={setSuccessMsg}
            />
          </div>
        ) : null}
      </div>
      <div style={{ paddingTop: "10px" }}>
        {data.searchForBuilds.map(b => (
          <div key={b.id} style={{ paddingTop: "10px" }}>
            <BuildCard
              build={b}
              removeBuildFunction={removeBuildFunction}
              editBuildFunction={editBuildFunction}
              setSuccessMsg={setSuccessMsg}
            />
          </div>
        ))}
        {data.searchForBuilds.length === 0
          ? "So far this user has no builds!"
          : null}
      </div>
    </div>
  )
}

export default BuildTab
