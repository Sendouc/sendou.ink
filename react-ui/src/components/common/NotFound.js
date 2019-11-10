import React from "react"
import { Header } from "semantic-ui-react"

const NotFound = () => {
  return (
    <div style={{ minHeight: "500px" }}>
      <Header as="h2">
        404 - Not Found
        <Header.Subheader>
          The page you tried to access couldn't be found. Sorry about that!
        </Header.Subheader>
      </Header>
    </div>
  )
}

export default NotFound
