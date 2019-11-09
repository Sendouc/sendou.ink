import React from "react"
import { Segment, Container, List, Icon } from "semantic-ui-react"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <Segment vertical>
      <Container textAlign="center">
        <List horizontal inverted link size="small">
          <List.Item as="a" href="https://github.com/sendouc/sendou-ink">
            <Icon name="github" size="big" />
          </List.Item>
          <List.Item as="a" href="https://discord.gg/J6NqUvt">
            <Icon name="discord" size="big" />
          </List.Item>
          <List.Item as={Link} to="/info">
            <Icon name="info circle" size="big" />
          </List.Item>
        </List>
      </Container>
    </Segment>
  )
}

export default Footer
