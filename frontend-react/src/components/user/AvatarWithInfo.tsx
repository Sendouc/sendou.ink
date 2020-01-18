import React from "react"
import { Flex, List, ListItem, ListIcon } from "@chakra-ui/core"
import { FaUserAlt, FaTwitter, FaTwitch, FaGamepad } from "react-icons/fa"

import UserAvatar from "../common/UserAvatar"
import { User } from "../../types"
import DividingBox from "../ui/DividingBox"
import Flag from "../common/Flag"
import { countries } from "../../utils/lists"

function getSensString(motion: number | undefined, stick: number): string {
  const stickSensString = `${stick > 0 ? "+" : ""}${stick} Stick`
  const motionSensString =
    motion !== undefined ? ` ${motion > 0 ? "+" : ""}${motion} Motion` : ""

  return `${stickSensString} ${motionSensString}`
}

interface AvatarWithInfoProps {
  user: User
}

const AvatarWithInfo: React.FC<AvatarWithInfoProps> = ({ user }) => {
  return (
    <Flex justifyContent="center" flexWrap="wrap" alignItems="center">
      <UserAvatar
        name={user.username}
        twitterName={user.twitter_name}
        size="2xl"
      />
      <DividingBox location="left">
        <List spacing={2} mx="0.5em" fontWeight="light">
          <ListItem>
            <ListIcon icon={FaUserAlt} />
            {user.username}#{user.discriminator}
          </ListItem>
          {user.country && (
            <ListItem>
              <Flag code={user.country} />
              {countries.find(obj => obj.code === user.country)?.name}
            </ListItem>
          )}
          {user.twitter_name && (
            <ListItem>
              <ListIcon icon={FaTwitter} />
              <a href={`https://twitter.com/${user.twitter_name}`}>
                {user.twitter_name}
              </a>
            </ListItem>
          )}
          {user.twitch_name && (
            <ListItem>
              <ListIcon icon={FaTwitch} />
              <a href={`https://www.twitch.tv/${user.twitch_name}`}>
                {user.twitch_name}
              </a>
            </ListItem>
          )}
          {user.sens?.stick && (
            <ListItem>
              <ListIcon icon={FaGamepad} />
              {getSensString(user.sens.motion, user.sens.stick)}
            </ListItem>
          )}
        </List>
      </DividingBox>
    </Flex>
  )
}

export default AvatarWithInfo
