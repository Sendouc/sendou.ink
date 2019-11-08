import React, { useEffect } from "react"
import { Tab, Image, List, Grid } from "semantic-ui-react"
import { Redirect } from "react-router-dom"
import { useQuery } from "@apollo/react-hooks"
import { useParams } from "react-router-dom"
import { searchForUser } from "../../graphql/queries/searchForUser"
import { userLean } from "../../graphql/queries/userLean"
import PlayerXRankStats from "../xsearch/PlayerXRankStats"
import BuildTab from "./BuildTab"
import Loading from "../common/Loading"
import Error from "../common/Error"

const UserPage = () => {
  const { id } = useParams()
  const { data, error, loading } = useQuery(searchForUser, {
    variables: { discord_id: id }
  })
  const userLeanQuery = useQuery(userLean)

  useEffect(() => {
    if (loading) return
    console.log("data", data)
    document.title = `${data.searchForUser.username} - sendou.ink`
  }, [loading, data])

  if (loading || userLeanQuery.loading) return <Loading />

  if (error) return <Error errorMessage={error.message} />

  if (userLeanQuery.error)
    return <Error errorMessage={userLeanQuery.error.message} />

  const userData = data.searchForUser
  if (!userData) return <Redirect to="/404" />

  const twitchDiscord = () => {
    if (userData.twitch_name && userData.twitter_name) {
      return (
        <>
          <List.Item>
            <List.Icon name="twitter" size="large" />
            <List.Content>
              <a href={`https://twitter.com/${userData.twitter_name}`}>
                {userData.twitter_name}
              </a>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name="twitch" size="large" />
            <List.Content>
              <a href={`https://www.twitch.tv/${userData.twitch_name}`}>
                {userData.twitch_name}
              </a>
            </List.Content>
          </List.Item>
        </>
      )
    } else if (userData.twitch_name) {
      return (
        <List.Item>
          <List.Icon name="twitch" size="large" />
          <List.Content>
            <a href={`https://www.twitch.tv/${userData.twitch_name}`}>
              {userData.twitch_name}
            </a>
          </List.Content>
        </List.Item>
      )
    } else if (userData.twitter_name) {
      return (
        <List.Item>
          <List.Icon name="twitter" size="large" />
          <List.Content>
            <a href={`https://twitter.com/${userData.twitter_name}`}>
              {userData.twitter_name}
            </a>
          </List.Content>
        </List.Item>
      )
    }
  }

  const panes = [
    {
      menuItem: "Builds",
      render: () => (
        <Tab.Pane>
          <BuildTab user={userLeanQuery.data.user} userViewed={userData} />
        </Tab.Pane>
      )
    },
    {
      menuItem: "X Rank",
      render: () => (
        <Tab.Pane>
          <PlayerXRankStats twitter={userData.twitter_name} tabMode />
        </Tab.Pane>
      )
    }
  ]

  return (
    <>
      <>
        <Grid stackable>
          <Grid.Column width={3}>
            <Image
              src={
                userData.avatar
                  ? `https://cdn.discordapp.com/avatars/${userData.discord_id}/${userData.avatar}.png`
                  : "https://cdn.discordapp.com/avatars/455039198672453645/088ae3838cc3b08b73f79aab0fefec2f.png"
              }
              rounded
            />
          </Grid.Column>
          <Grid.Column>
            <List>
              <List.Item>
                <List.Icon name="discord" size="large" />
                <List.Content>{`${userData.username}#${userData.discriminator}`}</List.Content>
              </List.Item>
              {twitchDiscord()}
            </List>
          </Grid.Column>
        </Grid>
      </>
      <div style={{ paddingTop: "1.5em" }}>
        <Tab panes={panes} />
      </div>
    </>
  )
}

export default UserPage
