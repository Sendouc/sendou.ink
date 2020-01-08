import React from "react"
import { Button, List, Image, Divider } from "semantic-ui-react"
import { useQuery } from "@apollo/react-hooks"

import SuggestionForm from "./SuggestionForm"
import { suggestions } from "../../graphql/queries/suggestions"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { vouches } from "../../graphql/queries/vouches"
import UserAvatar from "../common/UserAvatar"

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
  user,
  showSuggestionForm,
  setShowSuggestionForm,
  plusServer,
  handleSuccess,
  handleError,
}) => {
  const { data, error, loading } = useQuery(suggestions)
  const {
    data: vouchesData,
    error: vouchesError,
    loading: vouchesLoading,
  } = useQuery(vouches)

  if (loading || vouchesLoading) return <Loading minHeight="250px" />
  if (error) return <Error errorMessage={error.message} />
  if (vouchesError) return <Error errorMessage={vouchesError.message} />

  const ownSuggestion = data.suggestions.find(
    suggestion =>
      suggestion.suggester_discord_user.discord_id === user.discord_id
  )

  const canSuggest = !ownSuggestion

  const canVouch = Boolean(
    user.plus.can_vouch && !user.plus.can_vouch_again_after
  )

  const getButtonText = () => {
    if (canSuggest && canVouch) return "Suggest or vouch a player"
    else if (canSuggest) return "Suggest a player"
    else if (canVouch) return "Vouch a player"
  }

  return (
    <>
      {!showSuggestionForm && (canSuggest || canVouch) && (
        <div style={{ marginTop: "2em" }}>
          <Button onClick={() => setShowSuggestionForm(true)}>
            {getButtonText()}
          </Button>
        </div>
      )}
      {showSuggestionForm && (
        <SuggestionForm
          plusServer={plusServer}
          hideForm={() => setShowSuggestionForm(false)}
          handleSuccess={handleSuccess}
          handleError={handleError}
          canSuggest={canSuggest}
          canVouch={canVouch}
          canVouchFor={user.plus.can_vouch}
        />
      )}
      {vouchesData.vouches.length > 0 && (
        <>
          <h2>Vouched</h2>
          <List>
            {vouchesData.vouches.map(vouch => {
              return (
                <List.Item
                  key={vouch.username}
                  style={{
                    marginTop: "0.5em",
                  }}
                >
                  <UserAvatar twitterName={vouch.twitter_name} paddingIfNull />
                  <List.Content>
                    <List.Header as="a" href={`/u/${vouch.discord_id}`}>
                      {vouch.username}#{vouch.discriminator}{" "}
                    </List.Header>
                    <List.Description>
                      Vouched to{" "}
                      {vouch.plus.vouch_status === "ONE" ? "+1" : "+2"} by{" "}
                      {vouch.plus.voucher_user.username}#
                      {vouch.plus.voucher_user.discriminator}
                    </List.Description>
                  </List.Content>
                </List.Item>
              )
            })}
          </List>
        </>
      )}
      <SuggestionList suggestionsArray={data.suggestions} />
    </>
  )
}

export default Suggestions
