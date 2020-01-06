import React from "react"
import { Loader } from "semantic-ui-react"

const Loading = ({ inverted = false, minHeight = "500px" }) => {
  return (
    <div style={{ minHeight: minHeight }}>
      <Loader active inverted={inverted} inline="centered">
        Loading
      </Loader>
    </div>
  )
}

export default Loading
