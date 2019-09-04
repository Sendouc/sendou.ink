import React from "react"
import { PageHeader } from "antd"

const Segment = ({ children, title }) => {
  const segmentStyle = {
    background: "white",
    borderRadius: "5px",
    padding: "1px"
  }
  const childrenStyle = title
    ? { margin: "0 1.8em 1.5em" }
    : { margin: "1.5em 1.8em" }
  return (
    <div style={segmentStyle}>
      {title && (
        <div>
          <PageHeader title={title} />
        </div>
      )}
      <div style={childrenStyle}>{children}</div>
    </div>
  )
}

export default Segment
