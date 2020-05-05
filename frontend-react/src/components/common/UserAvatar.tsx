import React from "react"
import { Avatar, BoxProps } from "@chakra-ui/core"

interface UserAvatarProps {
  name: string
  src?: string
  size?: undefined | "2xl" | "lg" | "xs" | "sm"
}

const UserAvatar: React.FC<UserAvatarProps & BoxProps> = ({
  name,
  src,
  size,
  ...props
}) => {
  return <Avatar name={name} src={src} size={size} {...props} />
}

export default UserAvatar
