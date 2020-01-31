import React from "react"
import { Avatar, BoxProps } from "@chakra-ui/core"

interface UserAvatarProps {
  name: string
  twitterName?: string
  size?: undefined | "2xl"
}

const UserAvatar: React.FC<UserAvatarProps & BoxProps> = ({
  name,
  twitterName,
  size,
  ...props
}) => {
  return (
    <Avatar
      name={name}
      src={`https://avatars.io/twitter/${twitterName}`}
      size={size}
      {...props}
    />
  )
}

export default UserAvatar
