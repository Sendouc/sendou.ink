import React, { useState } from "react"
import { Button, Message, List, Image, Divider } from "semantic-ui-react"
import { useQuery } from "@apollo/react-hooks"

import SuggestionForm from "./SuggestionForm"
import { suggestions } from "../../graphql/queries/suggestions"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { userLean } from "../../graphql/queries/userLean"

const SuggestionList = ({ suggestionsArray }) => {
  if (suggestionsArray.length === 0) return null

  const suggestionLists = suggestionsArray.reduce(
    (acc, cur) => {
      const Item = (
        <React.Fragment key={cur.suggester_discord_user.discord_id}>
          <List.Item>
            <List.Content>
              {cur.discord_user.twitter_name && (
                <Image
                  avatar
                  size="mini"
                  src={`https://avatars.io/twitter/${cur.discord_user.twitter_name}`}
                />
              )}
              <List.Header as="a" href={`/u/${cur.discord_user.discord_id}`}>
                {cur.discord_user.username}#{cur.discord_user.discriminator}
              </List.Header>
              <List.Description>
                <div style={{ marginTop: "0.5em" }}>
                  <b>
                    {cur.plus_region} | Suggested by{" "}
                    <a href={`/u/${cur.suggester_discord_user.discord_id}`}>
                      {cur.suggester_discord_user.username}#
                      {cur.suggester_discord_user.discriminator}
                    </a>
                  </b>
                </div>
              </List.Description>
              <List.Description style={{ whiteSpace: "pre-wrap" }}>
                {cur.description}
              </List.Description>
            </List.Content>
          </List.Item>
          <Divider />
        </React.Fragment>
      )

      if (cur.plus_server === "ONE")
        return { ...acc, plus_one: [...acc.plus_one, Item] }

      return { ...acc, plus_two: [...acc.plus_two, Item] }
    },
    { plus_one: [], plus_two: [] }
  )

  return (
    <>
      {suggestionLists.plus_one.length > 0 && (
        <>
          <h2>Suggested to join +1</h2>
          {suggestionLists.plus_one}
        </>
      )}
      {suggestionLists.plus_two.length > 0 && (
        <>
          <h2>Suggested to join +2</h2>
          {suggestionLists.plus_two}
        </>
      )}
    </>
  )
}

const Suggestions = ({
  showSuggestionForm,
  setShowSuggestionForm,
  plusServer,
}) => {
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const { data, error, loading } = useQuery(suggestions)
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery(userLean)

  {
    /*just return on userLean error/loading */
  }

  if (loading || userQueryLoading) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />

  const ownSuggestion = data.suggestions.find(
    suggestion =>
      suggestion.suggester_discord_user.discord_id === userData.user.discord_id
  )

  const handleSuccess = () => {
    setSuccessMsg("Suggestion successfully added.")
    setShowSuggestionForm(false)
    setTimeout(() => {
      setSuccessMsg(null)
    }, 10000)
  }

  const handleError = error => {
    setErrorMsg(error.message)
    setShowSuggestionForm(false)
    setTimeout(() => {
      setErrorMsg(null)
    }, 10000)
  }

  return (
    <>
      {!showSuggestionForm && !ownSuggestion && (
        <div style={{ marginTop: "2em" }}>
          <Button onClick={() => setShowSuggestionForm(true)}>
            Suggest a player
          </Button>
        </div>
      )}
      {successMsg && <Message success>{successMsg}</Message>}
      {errorMsg && <Message error>{errorMsg}</Message>}
      {showSuggestionForm && (
        <SuggestionForm
          plusServer={plusServer}
          hideForm={() => setShowSuggestionForm(false)}
          handleSuccess={handleSuccess}
          handleError={handleError}
        />
      )}
      <SuggestionList suggestionsArray={data.suggestions} />
    </>
  )
}

export default Suggestions
