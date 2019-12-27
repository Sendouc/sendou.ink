import React from "react"
import { Menu, Container, Image, Dropdown, Icon } from "semantic-ui-react"
import { Link, NavLink, useHistory } from "react-router-dom"
import { userLean } from "../../graphql/queries/userLean"
import { useQuery } from "@apollo/react-hooks"
import sink_logo from "../../assets/sink_logo.png"

const dropdownStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  boxShadow: "3px 3px 5px rgba(0, 0, 0, 0.2)",
}

const MainMenu = () => {
  const { data, error, loading } = useQuery(userLean)
  const history = useHistory()

  const logInOrAva = () => {
    if (loading) return null

    if (!data || !data.user || error) {
      return (
        <Menu.Item href="/auth/discord" position="right">
          <Icon name="discord" size="large" style={{ paddingRight: "0.2em" }} />
          Log in via Discord
        </Menu.Item>
      )
    }

    const user = data.user

    const userMenuOptions = [
      {
        key: "user",
        text: "User Page",
        icon: "user",
        onClick: () => history.push(`/u/${user.discord_id}`),
      },
      {
        key: "sign-out",
        text: "Sign Out",
        icon: "sign out",
        onClick: () => window.location.assign("/logout"),
      },
    ]

    const userMenuTrigger = (
      <span>
        <span style={{ paddingRight: "5px" }}>{user.username}</span>
        <Image
          src={`https://avatars.io/twitter/${user.twitter_name}`}
          avatar
          onError={error =>
            console.error(
              `Couldn't fetch avatar image of ${user.twitter_name}.`
            )
          }
        />{" "}
      </span>
    )

    return (
      <Menu.Item position="right">
        <Dropdown
          item
          icon={null}
          options={userMenuOptions}
          trigger={userMenuTrigger}
        />
      </Menu.Item>
    )
  }
  return (
    <Menu inverted secondary attached="top" stackable>
      <Container>
        <Menu.Item as={Link} to="/" header>
          <Image src={sink_logo} style={{ height: "40px", width: "auto" }} />
        </Menu.Item>

        <Dropdown item text="Tools">
          <Dropdown.Menu style={dropdownStyle}>
            <Dropdown.Item as={NavLink} to="/maps">
              Maplist Generator
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/rotation">
              Rotation
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/plans">
              Map Planner
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/calendar">
              Calendar
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown item text="Collections">
          <Dropdown.Menu style={dropdownStyle}>
            <Dropdown.Item as={NavLink} to="/builds">
              Builds
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/freeagents">
              Free Agents
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/tournaments">
              Tournaments
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/links">
              Links
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown item text="X Rank">
          <Dropdown.Menu style={dropdownStyle}>
            <Dropdown.Item as={NavLink} to="/xleaderboard">
              Leaderboards
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/xsearch">
              Top 500 Browser
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/trends">
              Trends
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {logInOrAva()}
      </Container>
    </Menu>
  )
}

export default MainMenu
