import React from "react"
import { Icon, Header, List } from "semantic-ui-react"
import { useQuery } from "@apollo/react-hooks"
import { links } from "../../graphql/queries/links"
import Loading from "../common/Loading"
import Error from "../common/Error"

const Links = () => {
  const { data, error, loading } = useQuery(links)
  document.title = "Links - sendou.ink"

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  const linksData = data.links

  return (
    <>
      <div>
        <div>
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
    </>
  )
}

export default Links
