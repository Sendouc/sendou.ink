import React, { useState, useEffect } from "react"
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
import { useQueryParam, NumberParam } from "use-query-params"

const UserPage = () => {
  const { id } = useParams()
  const [tab, setTab] = useQueryParam("tab", NumberParam)
  const { data, error, loading } = useQuery(searchForUser, {
    variables: { discord_id: id },
  })
  const userLeanQuery = useQuery(userLean)

  const [activeIndex, setActiveIndex] = useState(tab ? tab : 0)

  useEffect(() => {
    if (loading || !data || !data.searchForUser) return
    document.title = `${data.searchForUser.username} - sendou.ink`
  }, [loading, data])

  if (loading || userLeanQuery.loading) return <Loading />

  if (error) return <Error errorMessage={error.message} />

  if (userLeanQuery.error)
    return <Error errorMessage={userLeanQuery.error.message} />

  const userData = data.searchForUser
  if (!userData) return <Redirect to="/404" />

  const twitterDiscord = () => {
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
      ),
    },
    {
      menuItem: "X Rank",
      render: () => (
        <Tab.Pane>
          <PlayerXRankStats twitter={userData.twitter_name} tabMode />
        </Tab.Pane>
      ),
    },
  ]

  const handleTabChange = (e, { activeIndex }) => {
    setActiveIndex(activeIndex)
    setTab(activeIndex)
  }

  return (
    <>
      <>
        <Grid stackable>
          <Grid.Column width={3}>
            {userData.twitter_name && (
              <Image
                src={`https://avatars.io/twitter/${userData.twitter_name}`}
                rounded
                onError={error =>
                  console.error(
                    `Couldn't fetch avatar image of ${userData.twitter_name}.`
                  )
                }
              />
            )}
          </Grid.Column>
          <Grid.Column>
            <List>
              <List.Item>
                <List.Icon name="discord" size="large" />
                <List.Content>{`${userData.username}#${userData.discriminator}`}</List.Content>
              </List.Item>
              {twitterDiscord()}
            </List>
          </Grid.Column>
        </Grid>
      </>
      <div style={{ paddingTop: "1.5em" }}>
        <Tab
          panes={panes}
          activeIndex={activeIndex}
          onTabChange={handleTabChange}
        />
      </div>
    </>
  )
}

export default UserPage
