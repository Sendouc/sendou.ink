import { Avatar, AvatarProps } from "@chakra-ui/react";
import React from "react";

interface Props {
  twitterName: string;
  isSmall?: boolean;
}

const TwitterAvatar: React.FC<Props & AvatarProps> = ({
  twitterName,
  isSmall,
  ...props
}) => (
  <Avatar
    name={twitterName}
    src={`https://api.microlink.io/?url=https://twitter.com/${twitterName}&amps;embed=image.url`}
    size={isSmall ? "sm" : undefined}
    {...props}
  />
);

export default TwitterAvatar;
