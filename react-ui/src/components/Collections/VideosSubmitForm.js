import React, { useState } from "react"
import { Button } from "antd"
import YouTubeVideo from "../elements/YouTubeVideo"

const VideosSubmitForm = () => {
  const [showForms, setShowForms] = useState(false)
  return (
    <>
      <Button onClick={() => setShowForms(!showForms)}>
        {showForms ? "Hide forms" : "Submit video"}
      </Button>
    </>
  )
}

export default VideosSubmitForm
