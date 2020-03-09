import React from "react"
import { FreeAgentPost } from "../../types"
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionIcon,
  AccordionPanel,
  Box,
  Grid,
  Flex,
  Heading,
} from "@chakra-ui/core"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import UserAvatar from "../common/UserAvatar"
import { Link } from "@reach/router"
import Flag from "../common/Flag"
import { countries } from "../../utils/lists"
import { FaTwitter } from "react-icons/fa"
import WeaponImage from "../common/WeaponImage"
import RoleIcons from "./RoleIcons"
import VCIcon from "./VCIcon"
import Alert from "../elements/Alert"

interface PostsAccordionProps {
  posts: FreeAgentPost[]
}

const hasExtraInfo = (post: FreeAgentPost) => {
  const { activity, description, looking_for, past_experience } = post
  if (!activity && !description && !looking_for && !past_experience) {
    return false
  }

  return true
}

const PostsAccordion: React.FC<PostsAccordionProps> = ({ posts }) => {
  const { darkerBgColor } = useContext(MyThemeContext)

  if (posts.length === 0) {
    return (
      <Alert status="info">No free agents found with the current filter</Alert>
    )
  }
  return (
    <Accordion allowMultiple>
      {posts.map(post => {
        const { discord_user } = post
        const canBeExpanded = hasExtraInfo(post)
        return (
          <AccordionItem key={post.id}>
            <AccordionHeader cursor={canBeExpanded ? undefined : "default"}>
              {canBeExpanded ? (
                <AccordionIcon size="2em" mr="1em" />
              ) : (
                <Box w="2em" h="2em" mr="1em" />
              )}
              <Grid
                gridTemplateColumns="repeat(auto-fill, 200px)"
                width="100%"
                rowGap="0.7em"
                justifyItems="center"
                justifyContent="center"
                alignItems="center"
              >
                <Link to={`/u/${discord_user.discord_id}`}>
                  <Flex alignItems="center">
                    <UserAvatar
                      twitterName={discord_user.twitter_name}
                      name={discord_user.username}
                      mr="5px"
                    />
                    <span>
                      {discord_user.username}#{discord_user.discriminator}
                    </span>
                  </Flex>
                </Link>
                <Box>
                  {discord_user.country && (
                    <>
                      <Flag code={discord_user.country} />
                      {
                        countries.find(obj => obj.code === discord_user.country)
                          ?.name
                      }
                    </>
                  )}
                </Box>
                <Flex alignItems="center">
                  {discord_user.twitter_name && (
                    <>
                      <Box as={FaTwitter} />
                      <Box as="span" ml="5px">
                        {discord_user.twitter_name}
                      </Box>
                    </>
                  )}
                </Flex>
                <Box color="#999999">
                  {new Date(parseInt(post.createdAt)).toLocaleDateString()}
                </Box>
                <Flex alignItems="center">
                  {discord_user?.weapons &&
                    discord_user.weapons.map(wpn => (
                      <Box mx="0.3em" key={wpn}>
                        <WeaponImage englishName={wpn} size="SMALL" />
                      </Box>
                    ))}
                </Flex>
                <RoleIcons playstyles={post.playstyles} />
                <VCIcon canVC={post.can_vc} />
              </Grid>
            </AccordionHeader>
            {canBeExpanded && (
              <AccordionPanel
                mt="3px"
                py={4}
                background={darkerBgColor}
                whiteSpace="pre-wrap"
                textAlign="center"
              >
                {post.activity && (
                  <Box>
                    <Heading size="md">Activity</Heading>
                    {post.activity}
                  </Box>
                )}
                {post.looking_for && (
                  <Box mt={post.activity ? "1em" : undefined}>
                    <Heading size="md">Looking for</Heading>
                    {post.looking_for}
                  </Box>
                )}
                {post.past_experience && (
                  <Box
                    mt={post.activity || post.looking_for ? "1em" : undefined}
                  >
                    <Heading size="md">Past experience</Heading>
                    {post.past_experience}
                  </Box>
                )}
                {post.description && (
                  <Box
                    mt={
                      post.activity || post.looking_for || post.past_experience
                        ? "1em"
                        : undefined
                    }
                  >
                    <Heading size="md">Description</Heading>
                    {post.description}
                  </Box>
                )}
              </AccordionPanel>
            )}
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export default PostsAccordion
