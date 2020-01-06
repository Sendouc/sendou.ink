import React from "react"
import UserAvatar from "../common/UserAvatar"
import { List, Icon, Popup } from "semantic-ui-react"

const getColor = score => (score < 50 ? { color: "red" } : { color: "green" })

const summaryMap = summary => {
  const { discord_user, score } = summary
  return (
    <List.Item
      key={discord_user.username}
      style={{
        marginTop: "0.5em",
      }}
    >
      <UserAvatar twitterName={discord_user.twitter_name} paddingIfNull />
      <List.Content>
        <List.Header as="a" href={`/u/${discord_user.discord_id}`}>
          {discord_user.username}#{discord_user.discriminator}{" "}
        </List.Header>
        <List.Description>
          <b>
            <span style={{ ...getColor(score.total) }}>{score.total}</span>%
          </b>{" "}
          (EU <span style={getColor(score.eu)}>{score.eu}</span>% | NA{" "}
          <span style={getColor(score.na)}>{score.na}</span>%)
          {summary.vouched && (
            <Popup
              content="User was vouched to the server last month"
              trigger={<Icon name="bolt" color="teal" size="large" />}
            />
          )}
        </List.Description>
      </List.Content>
    </List.Item>
  )
}

const SummaryLists = ({ summaries }) => {
  console.log("summaries", summaries)
  const members = []
  const suggested = []

  summaries.forEach(summary => {
    if (summary.suggested) suggested.push(summary)
    else members.push(summary)
  })
  return (
    <>
      <List>{members.map(summaryMap)}</List>
      <h3>Suggested</h3>
      <List>{suggested.map(summaryMap)}</List>
    </>
  )
}

export default SummaryLists
