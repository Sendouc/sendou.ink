import React from "react"
import { Menu, Container, Image, Dropdown, Button } from "semantic-ui-react"
import { NavLink } from "react-router-dom"
import sink_logo from "../../assets/sink_logo.png"

const dropdownStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  boxShadow: "3px 3px 5px rgba(0, 0, 0, 0.2)"
}

const MainMenu = () => {
  return (
    <Menu inverted attached="top" stackable>
      <Container>
        <Menu.Item as="a" header>
          <Image src={sink_logo} style={{ height: "40px", width: "auto" }} />
        </Menu.Item>

        <Dropdown item text="Tools">
          <Dropdown.Menu style={dropdownStyle}>
            <Dropdown.Item as={NavLink} exact to="/maps">
              Maplist Generator
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} exact to="/rotation">
              Rotation
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} exact to="/plans">
              Map Planner
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} exact to="/calendar">
              Calendar
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown item text="Collections">
          <Dropdown.Menu style={dropdownStyle}>
            <Dropdown.Item as={NavLink} exact to="/builds">
              Builds
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown item text="X Rank">
          <Dropdown.Menu style={dropdownStyle}>
            <Dropdown.Item as={NavLink} exact to="/xleaderboard">
              Leaderboards
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} exact to="/xsearch">
              Top 500 Browser
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} exact to="/trends">
              Trends
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Item position="right">
          <Button style={{ background: "#7289DA" }}>Log in via Discord</Button>
        </Menu.Item>
      </Container>
    </Menu>
  )
}

export default MainMenu
