import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "@apollo/react-hooks"
import {
  Message,
  Button,
  Modal,
  Header,
  Dropdown,
  Form,
  Grid,
} from "semantic-ui-react"
import Loading from "../common/Loading"
import Error from "../common/Error"
import FreeAgentTable from "./FreeAgentTable"
import FAPostForm from "./FAPostForm"

import WeaponDropdown from "../common/WeaponDropdown"
import { continents } from "../../utils/lists"
import { freeAgentPosts } from "../../graphql/queries/freeAgentPosts"
import { userLean } from "../../graphql/queries/userLean"
import { hideFreeAgentPost } from "../../graphql/mutations/hideFreeAgentPost"
import useWindowDimensions from "../../hooks/useWindowDimensions"

const FreeAgentBrowser = () => {
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState({
    weapon: "",
    playstyle: "",
    region: "",
  })

  const { containerWidth } = useWindowDimensions()

  useEffect(() => {
    document.title = "Free Agents - sendou.ink"
  }, [])

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
    setShowForm(false)
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
    post => post.discord_user.discord_id === userData.user?.discord_id
  )

  const millisecondsToHours = milliseconds =>
    Math.ceil(milliseconds / (1000 * 60 * 60))

  const ButtonHeader = () => {
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
      <Button.Group widths="1">
        <Button onClick={() => setShowForm(true)}>{buttonText}</Button>
        {ownFAPost && (
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
                Please note you can't submit a new one before a week has passed.
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
        )}
      </Button.Group>
    )
  }

  const FilterDropdowns = () => {
    const playstyleOptions = [
      { key: "FRONTLINE", text: "Frontline/Slayer", value: "FRONTLINE" },
      { key: "MIDLINE", text: "Midline/Support", value: "MIDLINE" },
      { key: "BACKLINE", text: "Backline/Anchor", value: "BACKLINE" },
    ]
    const regionOptions = [
      { key: "EUROPE", text: "Europe", value: "EUROPE" },
      { key: "AMERICAS", text: "The Americas", value: "AMERICAS" },
      { key: "AU/NZ", text: "Oceania", value: "AU/NZ" },
      { key: "OTHER", text: "Other", value: "OTHER" },
    ]

    return (
      <>
        <Header>Filter free agents</Header>
        <Form>
          <Form.Field>
            <label>Weapon</label>
            <WeaponDropdown
              clearable
              value={filter.weapon}
              onChange={(e, { value }) =>
                setFilter({ ...filter, weapon: value })
              }
            />
          </Form.Field>
          <Form.Field>
            <label>Playstyle</label>
            <Dropdown
              options={playstyleOptions}
              placeholder="Choose playstyle"
              selection
              closeOnEscape
              clearable
              value={filter.playstyle}
              onChange={(e, { value }) =>
                setFilter({ ...filter, playstyle: value })
              }
              style={{ width: "270px" }}
            />
          </Form.Field>
          <Form.Field>
            <label>Region</label>
            <Dropdown
              options={regionOptions}
              placeholder="Choose region"
              selection
              closeOnEscape
              clearable
              value={filter.region}
              onChange={(e, { value }) =>
                setFilter({ ...filter, region: value })
              }
              style={{ width: "270px" }}
            />
          </Form.Field>
        </Form>
      </>
    )
  }

  const NoPostsText = () => {
    if (showForm) return null

    if (
      filter.weapon === "" &&
      filter.playstyle === "" &&
      filter.region === ""
    ) {
      return <>No free agents at the moment. Be the first one!</>
    }

    return <>No free agents found matching the criteria.</>
  }

  const freeAgentPostArray = postsData.freeAgentPosts.filter(post => {
    if (post.hidden) return false

    if (filter.weapon) {
      if (post.discord_user.weapons.indexOf(filter.weapon) === -1) return false
    }

    if (filter.playstyle) {
      if (post.playstyles.indexOf(filter.playstyle) === -1) return false
    }

    if (filter.region) {
      if (!post.discord_user.country) {
        if (filter.region === "OTHER") return true

        return false
      }

      const continentCode = continents[post.discord_user.country]

      if (filter.region === "EUROPE" && continentCode !== "EU") return false
      else if (
        filter.region === "AMERICAS" &&
        continentCode !== "NA" &&
        continentCode !== "SA"
      )
        return false
      else if (filter.region === "AU/NZ" && continentCode !== "OC") return false
      else if (
        filter.region === "OTHER" &&
        continentCode !== "AF" &&
        continentCode !== "AN" &&
        continentCode !== "AS" &&
        continentCode !== "OC"
      )
        return false
    }

    return true
  })

  return (
    <>
      {successMsg && <Message success>{successMsg}</Message>}
      {errorMsg && <Message error>{errorMsg}</Message>}
      {showForm ? (
        <FAPostForm
          handleSuccess={handleSuccess}
          handleError={handleError}
          hideForm={() => setShowForm(false)}
          existingFAPost={ownFAPost}
        />
      ) : (
        <Grid stackable>
          <Grid.Column floated={"left"} width={8}>
            {!showForm && <FilterDropdowns />}
          </Grid.Column>
          <Grid.Column
            floated={containerWidth < 723 ? null : "right"}
            width={8}
          >
            <ButtonHeader />
          </Grid.Column>
        </Grid>
      )}
      <>
        <div style={{ marginTop: "2em" }}>
          {freeAgentPostArray.length > 0 ? (
            <FreeAgentTable FAArray={freeAgentPostArray} />
          ) : (
            <NoPostsText />
          )}
        </div>
      </>
    </>
  )
}

export default FreeAgentBrowser
