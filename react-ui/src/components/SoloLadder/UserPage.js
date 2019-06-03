import React from 'react'
import { Tab, Image, Loader, List, Grid } from 'semantic-ui-react'
import { useQuery } from 'react-apollo-hooks'
import { searchForUser } from '../../graphql/queries/searchForUser'
import InfoPlayer from '../../components/XSearch/InfoPlayer'

const UserPage = ({ userIdOrName }) => {
  const { data, error, loading } = useQuery(searchForUser, {variables: { discord_id: userIdOrName }})

  if (loading) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }

  if (error) {
    return <div style={{"color": "red"}}>{error.message}</div>
  }

  const userData = data.searchForUser
  document.title = `${userData.username} - sendou.ink`

  const twitchDiscord = () => {
    if (userData.twitch_name && userData.twitter_name) {
      return (
        <>
          <List.Item>
            <List.Icon name='twitter' size='large' />
            <List.Content><a href={`https://twitter.com/${userData.twitter_name}`}>{userData.twitter_name}</a></List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name='twitch' size='large' />
            <List.Content><a href={`https://www.twitch.tv/${userData.twitch_name}`}>{userData.twitch_name}</a></List.Content>
          </List.Item>
        </>
      )
    } else if (userData.twitch_name) {
      return (
        <List.Item>
          <List.Icon name='twitch' size='large' />
          <List.Content><a href={`https://www.twitch.tv/${userData.twitch_name}`}>{userData.twitch_name}</a></List.Content>
        </List.Item>
      )
    } else if (userData.twitter_name) {
      return (
        <List.Item>
          <List.Icon name='twitter' size='large' />
          <List.Content><a href={`https://twitter.com/${userData.twitter_name}`}>{userData.twitter_name}</a></List.Content>
        </List.Item>
      )
    }
  }

  const panes = [ //Solo Ladder to be added
    { menuItem: 'Builds', render: () => <Tab.Pane>No builds to show.</Tab.Pane> },
    { menuItem: 'X Rank', render: () => <Tab.Pane><InfoPlayer twitter={userData.twitter_name} /></Tab.Pane> },
  ]

  return (
    <div>
      <div>
        <Grid stackable>
          <Grid.Column width={3}>
            <Image 
              src={`https://cdn.discordapp.com/avatars/${userData.discord_id}/${userData.avatar}.png`} 
              rounded
            />
          </Grid.Column>
          <Grid.Column>
            <List>
              <List.Item>
                <List.Icon name='discord' size='large' />
                <List.Content>{`${userData.username}#${userData.discriminator}`}</List.Content>
              </List.Item>
              {twitchDiscord()}
              {/* "Member of Team Olive // Captain of Team Olive" */}
              {/* Weapons?" */}
            </List>
          </Grid.Column>
        </Grid>
      </div>
      <div>
        <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
      </div>
    </div>
  )
}

export default UserPage