import React from "react"
import { Avatar } from "@chakra-ui/core"

interface UserAvatarProps {
  name: string
  twitterName?: string
  size?: undefined | "2xl"
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, twitterName, size }) => {
  return (
    <Avatar
      name={name}
      src={`https://avatars.io/twitter/${twitterName}`}
      size={size}
    />
  )
}

export default UserAvatar
