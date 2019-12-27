import React, { useState } from "react"
import { Card, Image, Icon, Flag, Button } from "semantic-ui-react"
import InfiniteScroll from "react-infinite-scroller"
import { Link } from "react-router-dom"

import WpnImage from "../common/WpnImage"
import RoleIcons from "./RoleIcons"
import VCIcon from "./VCIcon"
import { countries } from "../../utils/lists"

const FreeAgentCard = ({ freeAgent }) => {
  const [expanded, setExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const {
    activity,
    description,
    looking_for,
    past_experience,
    playstyles,
    can_vc,
    createdAt,
    discord_user,
  } = freeAgent
  const {
    twitter_name,
    weapons,
    discord_id,
    discriminator,
    username,
    country,
  } = discord_user
  const playstylesObj = playstyles.reduce((acc, cur) => {
    acc[cur] = true
    return acc
  }, {})

  const hasExtraInfo = () => {
    if (!activity && !description && !looking_for && !past_experience) {
      return false
    }

    return true
  }

  return (
    <Card centered>
      {twitter_name && !imageError && (
        <Image
          src={`https://avatars.io/twitter/${twitter_name}`}
          wrapped
          ui={false}
          onError={() => setImageError(true)}
        />
      )}
      <Card.Content>
        <Card.Header>
          <Link to={`/u/${discord_id}`}>
            {username}#{discriminator}
          </Link>
        </Card.Header>
        <Card.Meta style={{ marginTop: "0.2em" }}>
          {country && (
            <>
              <Flag name={country} />{" "}
              {countries.reduce(
                (acc, cur) => (cur.code === country ? cur.name : acc),
                ""
              )}
            </>
          )}
        </Card.Meta>
        <Card.Description style={{ marginTop: "1em" }}>
          {twitter_name && !imageError && (
            <>
              <Icon name="twitter" size="large" style={{ color: "#1da1f2" }} />
              <a href={`https://twitter.com/${twitter_name}`}>{twitter_name}</a>
            </>
          )}
        </Card.Description>
        <Card.Description style={{ marginTop: "1em" }}>
          {weapons.map(weapon => (
            <WpnImage
              key={weapon}
              weapon={weapon}
              size="MEDIUM"
              style={{ width: "32px", height: "32px" }}
            />
          ))}
        </Card.Description>
        <Card.Description style={{ marginTop: "1em" }}>
          <RoleIcons playstyles={playstylesObj} /> | <VCIcon canVC={can_vc} />
        </Card.Description>
        <Card.Description style={{ marginTop: "1em", color: "#999999" }}>
          {new Date(parseInt(createdAt)).toLocaleDateString()}
        </Card.Description>
      </Card.Content>
      {hasExtraInfo() && !expanded && (
        <Card.Content extra>
          <Button basic onClick={() => setExpanded(true)}>
            Expand
          </Button>
        </Card.Content>
      )}
      {expanded && (
        <>
          {activity && (
            <>
              <Card.Content header="Activity" />
              <Card.Description
                style={{
                  marginTop: "1em",
                  whiteSpace: "pre-wrap",
                  padding: "1em",
                }}
              >
                {activity}
              </Card.Description>
            </>
          )}
          {past_experience && (
            <>
              <Card.Content header="Past experience" />
              <Card.Description
                style={{
                  marginTop: "1em",
                  whiteSpace: "pre-wrap",
                  padding: "1em",
                }}
              >
                {past_experience}
              </Card.Description>
            </>
          )}
          {looking_for && (
            <>
              <Card.Content header="Looking for" />
              <Card.Description
                style={{
                  marginTop: "1em",
                  whiteSpace: "pre-wrap",
                  padding: "1em",
                }}
              >
                {looking_for}
              </Card.Description>
            </>
          )}
          {description && (
            <>
              <Card.Content header="Description" />
              <Card.Description
                style={{
                  marginTop: "1em",
                  whiteSpace: "pre-wrap",
                  padding: "1em",
                }}
              >
                {description}
              </Card.Description>
            </>
          )}
          <Card.Content extra>
            <Button basic onClick={() => setExpanded(false)}>
              Collapse
            </Button>
          </Card.Content>
        </>
      )}
    </Card>
  )
}

const FreeAgentCards = ({ FAArray }) => {
  const [postsToShow, setPostsToShow] = useState(3)

  const loadMorePosts = page => {
    setPostsToShow(page * 3)
  }

  const visiblePosts = FAArray.filter((post, index) => index < postsToShow)

  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={loadMorePosts}
      hasMore={postsToShow < FAArray.length}
      loader={null}
    >
      {visiblePosts.map(fa => {
        return <FreeAgentCard key={fa.id} freeAgent={fa} />
      })}
    </InfiniteScroll>
  )
}

export default FreeAgentCards
