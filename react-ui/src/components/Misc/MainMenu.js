import React, { useState } from 'react'
import { Menu, Segment, Button, Icon, Image, Popup } from 'semantic-ui-react'
import { useQuery } from 'react-apollo-hooks'
import { userLean } from '../../graphql/queries/userLean'
import { withRouter } from 'react-router-dom'
import { memCakes } from '../../utils/lists'

const MainMenu = withRouter(({ history, menuSelection, setMenuSelection }) => {
  const [memCakePic, setMemCakePic] = useState(memCakes[Math.floor(Math.random()*memCakes.length)])
  const { data, error, loading } = useQuery(userLean)

  const logIn = () => {
    if (loading) {
      return null
    }

    if (!data.user || error) {
      return (
        <Menu.Item>
          <a href='/auth/discord'>
            <Button 
              style={{'color': '#7289DA'}} 
              inverted
            >
              Login via Discord
            </Button>
          </a>
        </Menu.Item>
      )
    }

    const user = data.user

    return (
      <div>
        <Menu.Item>
          <span style={{"paddingRight": "3px"}}>{user.username}</span>
          <Image src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png`} avatar />
          <span style={{"paddingLeft": "10px"}}>
            <Popup 
              position='bottom center'
              flowing
              hoverable
              trigger={<Icon name='log out' circular />}
            >
              <a href='/logout'>
                <Button secondary>Log Out</Button>
              </a>
            </Popup>
          </span>
        </Menu.Item>
      </div>
    )
  }

  return (
    <Segment inverted>
      <Menu inverted secondary stackable>
        <Menu.Item>
          <img src={process.env.PUBLIC_URL + `/memCakes/${memCakePic}`} alt="mem cake logo" onClick={() => setMemCakePic(memCakes[Math.floor(Math.random()*memCakes.length)])}/>
        </Menu.Item>
        <Menu.Item 
          name='maplists' 
          active={menuSelection === 'maplists'} 
          onClick={() => { history.push('/maps') }} 
        />
        <Menu.Item 
          name='rotations' 
          active={menuSelection === 'rotations'} 
          onClick={() => { 
            history.push('/rotation')
            setMenuSelection('rotations')
          }} 
        />
        <Menu.Item
          name='leaderboards'
          active={menuSelection === 'leaderboards'}
          onClick={() => { history.push('/xleaderboard') }}
        />
        <Menu.Item
          name='top 500 search'
          active={menuSelection === 'search'}
          onClick={() => { history.push('/xsearch') }}
        />
        <Menu.Item
          name='links'
          active={menuSelection === 'links'}
          onClick={() => { history.push('/links') }}
        />
        <Menu.Menu position='right'>
          {logIn()}
        </Menu.Menu>
      </Menu>
    </Segment>
  )
})

export default MainMenu