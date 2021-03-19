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
    src={
      user.discordAvatar
        ? `https://cdn.discordapp.com/avatars/${user.discordId}/${
            user.discordAvatar
          }.jpg${isSmall ? "?size=40" : ""}`
        : // default avatar
          `https://cdn.discordapp.com/avatars/455039198672453645/f809176af93132c3db5f0a5019e96339.jpg${
            isSmall ? "?size=40" : ""
          }`
    }
    size={isSmall ? "sm" : undefined}
    {...props}
  />
);

export default UserAvatar;
