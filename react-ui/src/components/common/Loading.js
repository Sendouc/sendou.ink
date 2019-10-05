import React from "react"
import { Loader } from "semantic-ui-react"

const Loading = () => {
  return (
    <div style={{ minHeight: "200px" }}>
      <Loader active inline="centered">
        Loading
      </Loader>
    </div>
  )
}

export default Loading
