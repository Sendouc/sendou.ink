import React, { useState } from "react"
import { Flex, List, ListItem, ListIcon } from "@chakra-ui/core"
import {
  FaUserAlt,
  FaTwitter,
  FaTwitch,
  FaGamepad,
  FaEdit,
} from "react-icons/fa"

import UserAvatar from "../common/UserAvatar"
import { User } from "../../types"
import Flag from "../common/Flag"
import { countries } from "../../utils/lists"
import IconButton from "../elements/IconButton"
import ProfileModal from "./ProfileModal"

function getSensString(motion: number | undefined, stick: number): string {
  const stickSensString = `${stick > 0 ? "+" : ""}${stick} Stick`
  const motionSensString =
    motion !== undefined ? ` ${motion > 0 ? "+" : ""}${motion} Motion` : ""

  return `${stickSensString} ${motionSensString}`
}

interface AvatarWithInfoProps {
  user: User
  canEdit?: boolean
}

const AvatarWithInfo: React.FC<AvatarWithInfoProps> = ({ user, canEdit }) => {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      {showModal && (
        <ProfileModal
          closeModal={() => setShowModal(false)}
          existingProfile={{
            ...user,
            motion_sens: user.sens?.motion,
            stick_sens: user.sens?.stick,
          }}
        />
      )}
      <Flex
        justifyContent="center"
        flexWrap="wrap"
        alignItems="center"
        flexDirection="column"
      >
        <UserAvatar name={user.username} src={user.avatar} size="2xl" />
        <List
          spacing={2}
          mt="1em"
          mx="0.5em"
          fontWeight="light"
          textAlign="center"
        >
          {canEdit && (
            <ListItem>
              <IconButton
                colored
                icon={FaEdit}
                onClick={() => setShowModal(true)}
              />
            </ListItem>
          )}
          <ListItem>
            <ListIcon icon={FaUserAlt} />
            {user.username}#{user.discriminator}
          </ListItem>
          {user.country && (
            <ListItem>
              <Flag code={user.country} />
              {countries.find((obj) => obj.code === user.country)?.name}
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
          {user.sens && (!!user.sens.stick || user.sens.stick === 0) && (
            <ListItem>
              <ListIcon icon={FaGamepad} />
              {getSensString(user.sens.motion, user.sens.stick)}
            </ListItem>
          )}
        </List>
      </Flex>
    </>
  )
}

export default AvatarWithInfo
