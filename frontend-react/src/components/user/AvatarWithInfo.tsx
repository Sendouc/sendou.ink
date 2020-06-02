import { Box, Flex, Heading } from "@chakra-ui/core"
import React, { useContext, useState } from "react"
import {
  FaEdit,
  FaGamepad,
  FaTwitch,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa"
import MyThemeContext from "../../themeContext"
import { User } from "../../types"
import Flag from "../common/Flag"
import UserAvatar from "../common/UserAvatar"
import WeaponImage from "../common/WeaponImage"
import Button from "../elements/Button"
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
  const { grayWithShade } = useContext(MyThemeContext)
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
      <Flex flexWrap="wrap">
        <UserAvatar
          name={user.username}
          src={user.avatar}
          size="2xl"
          mr="0.3em"
          mb="0.5rem"
        />
        <Flex flexDirection="column" justifyContent="center" mb="0.5rem">
          <Flex alignItems="center" my="0.2rem">
            <Heading fontFamily="'Rubik', sans-serif" size="lg" ml="0.5rem">
              {user.username}#{user.discriminator}
            </Heading>
            {user.country && <Flag code={user.country} />}
          </Flex>
          <Flex>
            <Flex maxW="300px" flexWrap="wrap">
              {user.twitter_name && (
                <Flex
                  alignItems="center"
                  mx="0.5em"
                  my="0.1em"
                  color={grayWithShade}
                >
                  <Box as={FaTwitter} mr="0.2em" />
                  <a href={`https://twitter.com/${user.twitter_name}`}>
                    {user.twitter_name}
                  </a>
                </Flex>
              )}
              {user.twitch_name && (
                <Flex
                  alignItems="center"
                  mx="0.5em"
                  my="0.1em"
                  color={grayWithShade}
                >
                  <Box as={FaTwitch} mr="0.2em" />
                  <a href={`https://www.twitch.tv/${user.twitch_name}`}>
                    {user.twitch_name}
                  </a>
                </Flex>
              )}
              {user.youtube_name && (
                <Flex
                  alignItems="center"
                  mx="0.5em"
                  my="0.1em"
                  color={grayWithShade}
                >
                  <Box as={FaYoutube} mr="0.2em" />
                  <a href={`https://youtube.com/c/${user.youtube_name}`}>
                    {user.youtube_name}
                  </a>
                </Flex>
              )}
              {user.sens && (!!user.sens.stick || user.sens.stick === 0) && (
                <Flex
                  alignItems="center"
                  mx="0.5em"
                  my="0.1em"
                  color={grayWithShade}
                  w="100%"
                >
                  <Box as={FaGamepad} mr="0.2em" />
                  {getSensString(user.sens.motion, user.sens.stick)}
                </Flex>
              )}
              {user.weapons && user.weapons.length > 0 && (
                <Flex mt="0.2rem" w="100%">
                  {user.weapons.map((wpn) => (
                    <Box mx="0.2em" key={wpn}>
                      <WeaponImage englishName={wpn} size="SMALL" />
                    </Box>
                  ))}
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
        {canEdit && (
          <Button icon={FaEdit} onClick={() => setShowModal(true)}>
            Edit profile
          </Button>
        )}
      </Flex>
    </>
  )
}

export default AvatarWithInfo
