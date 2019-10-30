import React from "react"
import { Menu, Container, Image, Dropdown, Icon } from "semantic-ui-react"
import { Link, NavLink } from "react-router-dom"
import sink_logo from "../../assets/sink_logo.png"

const dropdownStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  boxShadow: "3px 3px 5px rgba(0, 0, 0, 0.2)"
}

const MainMenu = () => {
  return (
    <Menu inverted secondary attached="top" stackable>
      <Container>
        <Menu.Item as="a" header>
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

        <Menu.Item as={Link} to="/auth/discord" position="right">
          <Icon name="discord" size="large" style={{ paddingRight: "0.2em" }} />
          Log in via Discord
        </Menu.Item>
      </Container>
    </Menu>
  )
}

export default MainMenu
