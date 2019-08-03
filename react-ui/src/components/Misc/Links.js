import React from "react"
import { Icon, Header, Loader, List, Segment } from "semantic-ui-react"
import { useQuery } from "react-apollo-hooks"
import { links } from "../../graphql/queries/links"

const Links = ({ setMenuSelection }) => {
  const { data, error, loading } = useQuery(links)

  setMenuSelection("links")
  document.title = "Links - sendou.ink"

  if (loading) {
    return (
      <div style={{ paddingTop: "25px", paddingBottom: "20000px" }}>
        <Loader active inline="centered" />
      </div>
    )
  }
  if (error) {
    return <div style={{ color: "red" }}>{error.message}</div>
  }
  const linksData = data.links

  return (
    <div>
      <Segment>
        <div style={{ padding: "5px" }}>
          <div style={{ paddingTop: "10px" }}>
            <Header as="h1">
              <Icon name="discord" />
              <Header.Content>Discord</Header.Content>
            </Header>
            <List divided verticalAlign="middle">
              {linksData.map(l => {
                if (l.type !== "DISCORD") {
                  return null
                }
                return (
                  <List.Item key={l.title} style={{ padding: "6px" }}>
                    <List.Header size="small" as="a" href={l.url}>
                      {l.title}
                    </List.Header>
                    <List.Description>{l.description}</List.Description>
                  </List.Item>
                )
              })}
            </List>
          </div>
          <div style={{ paddingTop: "20px" }}>
            <Header as="h1">
              <Icon name="book" />
              <Header.Content>Guides</Header.Content>
            </Header>
            <List divided verticalAlign="middle">
              {linksData.map(l => {
                if (l.type !== "GUIDE") {
                  return null
                }
                return (
                  <List.Item key={l.title} style={{ padding: "6px" }}>
                    <List.Header size="small" as="a" href={l.url}>
                      {l.title}
                    </List.Header>
                    <List.Description>{l.description}</List.Description>
                  </List.Item>
                )
              })}
            </List>
          </div>
          <div style={{ paddingTop: "20px" }}>
            <Header as="h1">
              <Icon name="folder open" />
              <Header.Content>Misc</Header.Content>
            </Header>
            <List divided verticalAlign="middle">
              {linksData.map(l => {
                if (l.type !== "MISC") {
                  return null
                }
                return (
                  <List.Item key={l.title} style={{ padding: "6px" }}>
                    <List.Header size="small" as="a" href={l.url}>
                      {l.title}
                    </List.Header>
                    <List.Description>{l.description}</List.Description>
                  </List.Item>
                )
              })}
            </List>
          </div>
        </div>
      </Segment>
    </div>
  )
}

export default Links
