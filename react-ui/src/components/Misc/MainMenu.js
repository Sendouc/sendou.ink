import React from 'react'
import { Menu, Button, Image, Dropdown } from 'semantic-ui-react'
import { useQuery } from '@apollo/react-hooks'
import { userLean } from '../../graphql/queries/userLean'
import { withRouter } from 'react-router-dom'
import memcake from '../img/misc/sink_logo.png'

const MainMenu = withRouter(({ history, menuSelection, setMenuSelection }) => {
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

    const userMenuOptions = [
      { key: 'user', text: 'User Page', icon: 'user', onClick: () => history.push(`/u/${user.discord_id}`) },
      //{ key: 'settings', text: 'Settings', icon: 'settings', onClick: () => history.push('/u/settings') },
      { key: 'sign-out', text: 'Sign Out', icon: 'sign out', onClick: () => window.location.assign('/logout') },
    ]

    const userMenuTrigger = (
      <span>
        <span style={{"paddingRight": "5px"}}>{user.username}</span>
          <Image src={user.avatar ? 
          `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png` : 
          'https://cdn.discordapp.com/avatars/455039198672453645/088ae3838cc3b08b73f79aab0fefec2f.png'} avatar /> {/* If User has no avatar defaults to N-Zap user's avatar*/}
      </span>
    )
    
    return (
      <div>
        <Menu.Item>
          <Dropdown item icon={null} options={userMenuOptions} trigger={userMenuTrigger}/>
        </Menu.Item>
      </div>
    )
  }

  return (
    <Menu stackable borderless>
      <Menu.Item>
        <img src={memcake} alt='memcake logo' />
      </Menu.Item>
      <Menu.Item 
        name='home' 
        active={menuSelection === 'home'} 
        onClick={() => { history.push('/') }} 
      />
      <Dropdown item text='Tools'>
        <Dropdown.Menu>
        <Menu.Item 
        name='maplists' 
        active={menuSelection === 'maplists'} 
        onClick={() => { history.push('/maps') }} 
        />
        <Menu.Item 
          name='rotation' 
          active={menuSelection === 'rotations'} 
          onClick={() => { 
            history.push('/rotation')
            setMenuSelection('rotations')
          }} 
        />
        <Menu.Item 
          name='builds' 
          active={menuSelection === 'builds'} 
          onClick={() => { 
            history.push('/builds')
            setMenuSelection('builds')
          }} 
        />
        <Menu.Item 
          name='plan' 
          active={menuSelection === 'plans'} 
          onClick={() => { 
            history.push('/plans')
            setMenuSelection('plans')
          }} 
        />
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown item text='X Rank'>
          <Dropdown.Menu>
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
            name='trends'
            active={menuSelection === 'trends'}
            onClick={() => { history.push('/trends') }}
          />
          </Dropdown.Menu>
      </Dropdown>
      <Menu.Item
        name='calendar'
        active={menuSelection === 'calendar'}
        onClick={() => { history.push('/calendar') }}
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
  )
})

export default MainMenu