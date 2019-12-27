import React from "react"
import { Menu, Responsive } from "semantic-ui-react"
import { NavLink } from "react-router-dom"

import allIcon from "../../assets/xleaderboardIcons/all.png"
import flexIcon from "../../assets/xleaderboardIcons/flex.png"
import blasterIcon from "../../assets/xleaderboardIcons/blasters.png"
import brellaIcon from "../../assets/xleaderboardIcons/brellas.png"
import chargerIcon from "../../assets/xleaderboardIcons/chargers.png"
import dualieIcon from "../../assets/xleaderboardIcons/dualies.png"
import rollerIcon from "../../assets/xleaderboardIcons/rollers.png"
import shooterIcon from "../../assets/xleaderboardIcons/shooters.png"
import slosherIcon from "../../assets/xleaderboardIcons/sloshers.png"
import splatlingIcon from "../../assets/xleaderboardIcons/splatlings.png"

const XLeaderBoardMenu = () => {
  const wpnIcon = {
    paddingBottom: "5px"
  }
  return (
    <div className="ui centered grid">
      <div className="center aligned column">
        <Responsive minWidth={800}>
          <Menu compact icon="labeled">
            <Menu.Item name="all" as={NavLink} exact to="/xleaderboard">
              <img style={wpnIcon} src={allIcon} alt="All Icon" />
              All
            </Menu.Item>

            <Menu.Item name="flex" as={NavLink} exact to="/xleaderboard/flex">
              <img style={wpnIcon} src={flexIcon} alt="Flex Icon" />
              Flex
            </Menu.Item>

            <Menu.Item
              name="shooters"
              as={NavLink}
              exact
              to="/xleaderboard/shooters"
            >
              <img style={wpnIcon} src={shooterIcon} alt="Shooter Icon" />
              Shooters
            </Menu.Item>

            <Menu.Item
              name="blasters"
              as={NavLink}
              exact
              to="/xleaderboard/blasters"
            >
              <img style={wpnIcon} src={blasterIcon} alt="Blaster Icon" />
              Blasters
            </Menu.Item>

            <Menu.Item
              name="rollers"
              as={NavLink}
              exact
              to="/xleaderboard/rollers"
            >
              <img style={wpnIcon} src={rollerIcon} alt="Roller Icon" />
              Rollers
            </Menu.Item>

            <Menu.Item
              name="chargers"
              as={NavLink}
              exact
              to="/xleaderboard/chargers"
            >
              <img style={wpnIcon} src={chargerIcon} alt="Charger Icon" />
              Chargers
            </Menu.Item>

            <Menu.Item
              name="splatlings"
              as={NavLink}
              exact
              to="/xleaderboard/splatlings"
            >
              <img style={wpnIcon} src={splatlingIcon} alt="Splatling Icon" />
              Splatlings
            </Menu.Item>

            <Menu.Item
              name="sloshers"
              as={NavLink}
              exact
              to="/xleaderboard/sloshers"
            >
              <img style={wpnIcon} src={slosherIcon} alt="Slosher Icon" />
              Sloshers
            </Menu.Item>

            <Menu.Item
              name="dualies"
              as={NavLink}
              exact
              to="/xleaderboard/dualies"
            >
              <img style={wpnIcon} src={dualieIcon} alt="Dualie Icon" />
              Dualies
            </Menu.Item>

            <Menu.Item
              name="brella"
              as={NavLink}
              exact
              to="/xleaderboard/brellas"
            >
              <img style={wpnIcon} src={brellaIcon} alt="Brella Icon" />
              Brellas
            </Menu.Item>
          </Menu>
        </Responsive>
        <Responsive maxWidth={799}>
          <Menu compact icon="labeled">
            <Menu.Item name="all" as={NavLink} exact to="/xleaderboard">
              <img style={wpnIcon} src={allIcon} alt="All Icon" />
              All
            </Menu.Item>
            <Menu.Item name="flex" as={NavLink} exact to="/xleaderboard/flex">
              <img style={wpnIcon} src={flexIcon} alt="Flex Icon" />
              Flex
            </Menu.Item>
          </Menu>
          <Menu compact icon="labeled">
            <Menu.Item
              name="shooters"
              as={NavLink}
              exact
              to="/xleaderboard/shooters"
            >
              <img style={wpnIcon} src={shooterIcon} alt="Shooter Icon" />
              Shooters
            </Menu.Item>

            <Menu.Item
              name="blasters"
              as={NavLink}
              exact
              to="/xleaderboard/blasters"
            >
              <img style={wpnIcon} src={blasterIcon} alt="Blaster Icon" />
              Blasters
            </Menu.Item>

            <Menu.Item
              name="rollers"
              as={NavLink}
              exact
              to="/xleaderboard/rollers"
            >
              <img style={wpnIcon} src={rollerIcon} alt="Roller Icon" />
              Rollers
            </Menu.Item>

            <Menu.Item
              name="chargers"
              as={NavLink}
              exact
              to="/xleaderboard/chargers"
            >
              <img style={wpnIcon} src={chargerIcon} alt="Charger Icon" />
              Chargers
            </Menu.Item>
          </Menu>
          <Menu compact icon="labeled">
            <Menu.Item
              name="splatlings"
              as={NavLink}
              exact
              to="/xleaderboard/splatlings"
            >
              <img style={wpnIcon} src={splatlingIcon} alt="Splatling Icon" />
              Splatlings
            </Menu.Item>

            <Menu.Item
              name="sloshers"
              as={NavLink}
              exact
              to="/xleaderboard/sloshers"
            >
              <img style={wpnIcon} src={slosherIcon} alt="Slosher Icon" />
              Sloshers
            </Menu.Item>

            <Menu.Item
              name="dualies"
              as={NavLink}
              exact
              to="/xleaderboard/dualies"
            >
              <img style={wpnIcon} src={dualieIcon} alt="Dualie Icon" />
              Dualies
            </Menu.Item>

            <Menu.Item
              name="brella"
              as={NavLink}
              exact
              to="/xleaderboard/brellas"
            >
              <img style={wpnIcon} src={brellaIcon} alt="Brella Icon" />
              Brellas
            </Menu.Item>
          </Menu>
        </Responsive>
      </div>
    </div>
  )
}

export default XLeaderBoardMenu
