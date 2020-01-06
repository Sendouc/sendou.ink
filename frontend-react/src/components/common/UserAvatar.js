import React, { useState } from "react"
import { Image } from "semantic-ui-react"

const UserAvatar = ({ twitterName, paddingIfNull = false }) => {
  const [imageError, setImageError] = useState(false)

  if ((!twitterName || imageError) && paddingIfNull)
    return <Image style={{ marginLeft: "2em" }} />
  if (!twitterName || imageError) return null

  return (
    <Image
      src={`https://avatars.io/twitter/${twitterName}`}
      avatar
      onError={error => setImageError(true)}
    />
  )
}

export default UserAvatar
