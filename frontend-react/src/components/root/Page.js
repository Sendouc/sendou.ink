import React from "react"
import { Header, Icon } from "semantic-ui-react"

const Page = ({ title, subtitle, icon, children }) => {
  return (
    <div
      style={{
        background: "white",
        padding: "2em 3em",
        margin: "0 -2em 0 -2em",
        borderRadius: "7px",
      }}
    >
      <div>
        {title && !subtitle && <Header as="h3">{title}</Header>}
        {title && subtitle && (
          <Header as="h2">
            {icon && <Icon name={icon} />}
            <Header.Content>
              {title}
              <Header.Subheader>{subtitle}</Header.Subheader>
            </Header.Content>
          </Header>
        )}
      </div>
      <div style={{ marginTop: !title ? null : "1.5em" }}>{children}</div>
    </div>
  )
}

export default Page
