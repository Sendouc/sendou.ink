import React, { useState } from "react"
import { useQuery, useMutation } from "@apollo/react-hooks"
import { Button, Message, Card } from "semantic-ui-react"

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
    variables: { discord_id: userViewed.discord_id },
  })
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleError = error => {
    console.log("error", error)
    setErrorMsg(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMsg(null)
    }, 10000)
  }

  const [addBuildMutation] = useMutation(addBuild, {
    onError: handleError,
    refetchQueries: [
      {
        query: searchForBuilds,
        variables: { discord_id: userViewed.discord_id },
      },
    ],
  })

  const [deleteBuildMutation] = useMutation(deleteBuild, {
    onError: handleError,
    refetchQueries: [
      {
        query: searchForBuilds,
        variables: { discord_id: userViewed.discord_id },
      },
    ],
  })

  const [editBuildMutation] = useMutation(updateBuild, {
    onError: handleError,
    refetchQueries: [
      {
        query: searchForBuilds,
        variables: { discord_id: userViewed.discord_id },
      },
    ],
  })

  const deleteBuildById = async ({ id, title, weapon }) => {
    await deleteBuildMutation({
      variables: { id },
    })

    const buildTitle = title ? title : `${weapon} build`

    setSuccessMsg(`Successfully deleted ${buildTitle}`)
    window.scrollTo(0, 0)
    setTimeout(() => {
      setSuccessMsg(null)
    }, 10000)
  }

  const editBuildById = async build => {
    await editBuildMutation({
      variables: { ...build },
    })

    setSuccessMsg("Build successfully edited")
    window.scrollTo(0, 0)
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
      {successMsg && !errorMsg && (
        <div style={{ paddingBottom: "10px" }}>
          <Message success content={successMsg} />
        </div>
      )}
      {errorMsg && (
        <div style={{ paddingBottom: "10px" }}>
          <Message negative content={errorMsg} />
        </div>
      )}
      <div>
        {data.searchForBuilds.length >= 100 &&
        user &&
        user.discord_id === userViewed.discord_id
          ? "Looks like you have 100 buids. Insane flex. Delete a build before adding a new one."
          : null}
        {!user ||
        user.discord_id !== userViewed.discord_id ||
        data.searchForBuilds.length >= 100 ? null : (
          <Button
            circular
            size="tiny"
            icon={showForm ? "minus" : "plus"}
            onClick={() => setShowForm(!showForm)}
          />
        )}
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
      <Card.Group style={{ marginTop: "0.8em" }}>
        {data.searchForBuilds.map(b => (
          <BuildCard
            key={b.id}
            build={b}
            removeBuildFunction={removeBuildFunction}
            editBuildFunction={editBuildFunction}
            setSuccessMsg={setSuccessMsg}
          />
        ))}
        {data.searchForBuilds.length === 0
          ? "So far this user has no builds!"
          : null}
      </Card.Group>
    </div>
  )
}

export default BuildTab
