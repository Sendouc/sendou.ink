import { Avatar, BoxProps, AvatarProps } from "@chakra-ui/core"
import React, { useState } from "react"

interface UserAvatarProps {
  name: string
  src?: string
  size?: undefined | "2xl" | "xl" | "lg" | "xs" | "sm"
}

const UserAvatar: React.FC<UserAvatarProps & AvatarProps> = ({
  name,
  src,
  size,
  ...props
}) => {
  const [isBeingHovered, setIsBeingHovered] = useState(false)
  if (src?.includes("a_")) {
    return (
      <Avatar
        name={name}
        src={`${src}${isBeingHovered ? "gif" : "jpg"}`}
        h={size}
        w={size}
        {...props}
        onMouseEnter={() => setIsBeingHovered(true)}
        onMouseLeave={() => setIsBeingHovered(false)}
      />
    )
  }
  return <Avatar name={name} src={`${src}jpg`} h={size} w={size} {...props} />
}

export default UserAvatar
