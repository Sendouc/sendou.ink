import React from "react"
import { Loader } from "semantic-ui-react"

const Loading = ({ minHeight = "500px" }) => {
  return (
    <div style={{ minHeight: minHeight }}>
      <Loader active inline="centered">
        Loading
      </Loader>
    </div>
  )
}

export default Loading
