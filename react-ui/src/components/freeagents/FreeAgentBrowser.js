import React, { useState } from "react"
import NewFAPostForm from "./NewFAPostForm"
import { Message, Button } from "semantic-ui-react"
import { freeAgentPosts } from "../../graphql/queries/freeAgentPosts"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { useQuery } from "@apollo/react-hooks"
import FreeAgentTable from "./FreeAgentTable"

const FreeAgentBrowser = () => {
  const [successMsg, setSuccessMsg] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const { data, error, loading } = useQuery(freeAgentPosts)

  const handleSuccess = () => {
    setSuccessMsg(
      "New free agent post successfully created! Good luck finding a team 😎"
    )
    setShowForm(false)
    setTimeout(() => {
      setSuccessMsg(null)
    }, 10000)
  }

  const showButton = () => {
    if (showForm) return false

    return true
  }

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  console.log("data", data)

  return (
    <>
      {successMsg && <Message success>{successMsg}</Message>}
      {showButton() && (
        <Button onClick={() => setShowForm(true)}>New free agent post</Button>
      )}
      {showForm && (
        <NewFAPostForm
          handleSuccess={handleSuccess}
          hideForm={() => setShowForm(false)}
        />
      )}
      {data.freeAgentPosts.length > 0 ? (
        <FreeAgentTable FAArray={data.freeAgentPosts} />
      ) : (
        <>No free agents at the moment</>
      )}
    </>
  )
}

export default FreeAgentBrowser
