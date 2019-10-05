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
    <Segment inverted vertical style={{ padding: "5em 0em" }}>
      <Container textAlign="center">
        <Grid divided inverted stackable>
          <Grid.Column width={3}>
            <Header inverted as="h4" content="Popular on sendou.ink" />
            <List link inverted>
              <List.Item as="a">Builds</List.Item>
              <List.Item as="a">Map Planner</List.Item>
              <List.Item as="a">X Rank Search</List.Item>
              <List.Item as="a">Rotations</List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={3}>
            <Header inverted as="h4" content="Follow Sendou" />
            <List link inverted>
              <List.Item as="a">Twitter</List.Item>
              <List.Item as="a">Twitch</List.Item>
              <List.Item as="a">YouTube</List.Item>
              <List.Item as="a">Discord</List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={3}>
            <Header inverted as="h4" content="Splatoon elsewhere" />
            <List link inverted>
              <List.Item as="a">Splatoonwiki</List.Item>
              <List.Item as="a">Some random</List.Item>
              <List.Item as="a">Links</List.Item>
              <List.Item as="a">More</List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={4}>
            <RollSim />
          </Grid.Column>
        </Grid>

        <Divider inverted section />
        <List horizontal inverted divided link size="small">
          <List.Item as="a" href="#">
            View Source on Github
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
