import React, { useState } from "react"
import { useQuery, useMutation } from "@apollo/react-hooks"
import { Message, Button, Modal, Header, Dropdown } from "semantic-ui-react"
import Loading from "../common/Loading"
import Error from "../common/Error"
import FreeAgentTable from "./FreeAgentTable"
import FAPostForm from "./FAPostForm"

import { freeAgentPosts } from "../../graphql/queries/freeAgentPosts"
import { userLean } from "../../graphql/queries/userLean"
import { hideFreeAgentPost } from "../../graphql/mutations/hideFreeAgentPost"

const FreeAgentBrowser = () => {
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const {
    data: postsData,
    error: faQueryError,
    loading: faQueryLoading,
  } = useQuery(freeAgentPosts)
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery(userLean)

  const handleSuccess = message => {
    setSuccessMsg(message)
    setShowForm(false)
    setTimeout(() => {
      setSuccessMsg(null)
    }, 10000)
  }

  const handleError = error => {
    setErrorMsg(error.message)
    setTimeout(() => {
      setErrorMsg(null)
    }, 10000)
  }

  const [hideFreeAgentPostMutation] = useMutation(hideFreeAgentPost, {
    onError: handleError,
    onCompleted: () => handleSuccess("Free agent post successfully deleted"),
    refetchQueries: [
      {
        query: freeAgentPosts,
      },
    ],
  })

  if (faQueryLoading || userQueryLoading) return <Loading />
  if (faQueryError) return <Error errorMessage={faQueryError.message} />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />

  const ownFAPost = postsData.freeAgentPosts.find(
    post => post.discord_user.discord_id === userData.user.discord_id
  )

  const millisecondsToHours = milliseconds =>
    Math.ceil(milliseconds / (1000 * 60 * 60))

  const freeAgentPostArray = postsData.freeAgentPosts.filter(
    post => !post.hidden
  )

  const ButtonHeader = () => {
    if (showForm) return null
    if (!userData.user)
      return <Message>Please log in to submit your own free agent post</Message>

    // if their own free agent post is hidden it means they have deleted it previously
    // creating new post is only possible after waiting a week
    if (ownFAPost) {
      const weekFromCreatingFAPost = parseInt(ownFAPost.createdAt) + 604800000
      if (
        !ownFAPost ||
        (ownFAPost.hidden && weekFromCreatingFAPost > Date.now())
      ) {
        return (
          <Message warning>
            You can post a new free agent post in{" "}
            {millisecondsToHours(weekFromCreatingFAPost - Date.now())} hours
          </Message>
        )
      }
    }

    const buttonText = ownFAPost
      ? "Edit free agent post"
      : "New free agent post"

    return (
      <div style={{ float: "right" }}>
        <Button onClick={() => setShowForm(true)}>{buttonText}</Button>
        {ownFAPost && (
          <span style={{ marginLeft: "0.3em" }}>
            <Modal
              basic
              size="small"
              closeIcon
              trigger={<Button negative>Delete your post</Button>}
            >
              <Header
                icon="trash alternate"
                content="Delete your free agent post?"
              />
              <Modal.Content>
                <p>
                  Please note you can't submit a new one before a week has
                  passed.
                </p>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  inverted
                  color="red"
                  onClick={() => hideFreeAgentPostMutation()}
                >
                  Yes
                </Button>
              </Modal.Actions>
            </Modal>
          </span>
        )}
      </div>
    )
  }

  const FilterDropdowns = () => {
    const playstyleOptions = [
      { key: "ALL", text: "all", value: "ALL" },
      { key: "FRONTLINE", text: "Frontline/Slayer", value: "FRONTLINE" },
      { key: "MIDLINE", text: "Midline/Support", value: "MIDLINE" },
      { key: "BACKLINE", text: "Backline/Anchor", value: "BACKLINE" },
    ]
    return (
      <>
        Show posts by{" "}
        <Dropdown
          upward
          floating
          inline
          options={playstyleOptions}
          defaultValue="ALL"
        />{" "}
        roles.
      </>
    )
  }

  return (
    <>
      {successMsg && <Message success>{successMsg}</Message>}
      {errorMsg && <Message error>{errorMsg}</Message>}
      <ButtonHeader />
      {showForm && (
        <FAPostForm
          handleSuccess={handleSuccess}
          handleError={handleError}
          hideForm={() => setShowForm(false)}
          existingFAPost={ownFAPost}
        />
      )}
      <>
        {freeAgentPostArray.length > 0 ? (
          <>
            <FilterDropdowns />
            {/*<FreeAgentTable FAArray={freeAgentPostArray} />*/}
            <div style={{ marginTop: "1em" }}>
              <FreeAgentTable
                FAArray={Array(100).fill(freeAgentPostArray[0])}
              />
            </div>
          </>
        ) : (
          <>No free agents at the moment. Be the first one!</>
        )}
      </>
    </>
  )
}

export default FreeAgentBrowser
