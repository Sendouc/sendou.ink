import { Avatar, AvatarProps } from "@chakra-ui/react";
import { User } from "@prisma/client";
import React from "react";

interface Props {
  user: Pick<User, "discordId" | "username" | "discordAvatar">;
  isSmall?: boolean;
}

const UserAvatar: React.FC<Props & AvatarProps> = ({
  user,
  isSmall,
  ...props
}) => (
  <Avatar
    name={user.username}
    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${
      user.discordAvatar
    }.jpg${isSmall ? "?size=40" : ""}`}
    size={isSmall ? "sm" : undefined}
    {...props}
  />
);

export default UserAvatar;
