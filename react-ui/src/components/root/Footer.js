import React from "react"
import {
  Segment,
  Container,
  Grid,
  Header,
  List,
  Divider
} from "semantic-ui-react"
import RollSim from "./RollSim"

const Footer = () => {
  return (
    <Segment vertical style={{ padding: "1em 0em" }}>
      <Container textAlign="center">
        <List horizontal inverted divided link size="small">
          <List.Item as="a" href="#">
            About
          </List.Item>
          <List.Item as="a" href="#">
            View Source on Github
          </List.Item>
          <List.Item as="a" href="#">
            Join the community on Discord
          </List.Item>
          <List.Item as="a" href="#">
            Thanks to
          </List.Item>
        </List>
      </Container>
    </Segment>
  )
}

export default Footer
