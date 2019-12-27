import React, { useState } from "react"
import { Table, Image, Icon, Flag } from "semantic-ui-react"
import { Link } from "react-router-dom"
import { countries } from "../../utils/lists"
import top500 from "../../assets/xleaderboardIcons/all.png"
import WpnImage from "../common/WpnImage"
import RoleIcons from "./RoleIcons"
import VCIcon from "./VCIcon"
import TextRows from "./TextRows"

const FATableRows = ({ freeAgent }) => {
  const [expanded, setExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const twitter = freeAgent.discord_user.twitter_name
  const playstyles = freeAgent.playstyles.reduce((acc, cur) => {
    acc[cur] = true
    return acc
  }, {})

  const hasExtraInfo = () => {
    const { activity, description, looking_for, past_experience } = freeAgent
    if (!activity && !description && !looking_for && !past_experience) {
      return false
    }

    return true
  }

  return (
    <>
      <Table.Row>
        <Table.Cell rowSpan={2} width={1}>
          {hasExtraInfo() && (
            <Icon
              name={expanded ? "angle down" : "angle right"}
              size="big"
              onClick={() => setExpanded(!expanded)}
              style={{ cursor: "pointer" }}
            />
          )}
        </Table.Cell>
        <Table.Cell width={4}>
          {twitter ? (
            <>
              {!imageError && (
                <Image
                  src={`https://avatars.io/twitter/${twitter}`}
                  avatar
                  onError={() => setImageError(true)}
                />
              )}
              <span>
                <Link to={`/u/${freeAgent.discord_user.discord_id}`}>
                  {freeAgent.discord_user.username}#
                  {freeAgent.discord_user.discriminator}
                </Link>
              </span>
            </>
          ) : (
            <Link to={`/u/${freeAgent.discord_user.discord_id}`}>
              {freeAgent.discord_user.username}#
              {freeAgent.discord_user.discriminator}
            </Link>
          )}
        </Table.Cell>
        <Table.Cell>
          {freeAgent.discord_user.country && (
            <>
              <Flag name={freeAgent.discord_user.country} />
              {countries.reduce(
                (acc, cur) =>
                  cur.code === freeAgent.discord_user.country ? cur.name : acc,
                ""
              )}
            </>
          )}
        </Table.Cell>
        <Table.Cell>
          {twitter && !imageError && (
            <>
              <Icon name="twitter" size="large" style={{ color: "#1da1f2" }} />
              <a href={`https://twitter.com/${twitter}`}>{twitter}</a>
            </>
          )}
        </Table.Cell>
        <Table.Cell>
          <span style={{ color: "#999999" }}>
            {new Date(parseInt(freeAgent.createdAt)).toLocaleDateString()}
          </span>
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell style={{ borderStyle: "hidden" }}>
          {freeAgent.discord_user.weapons.map(weapon => (
            <WpnImage
              key={weapon}
              weapon={weapon}
              size="small"
              style={{ float: "left" }}
            />
          ))}
        </Table.Cell>
        <Table.Cell style={{ borderStyle: "hidden" }}>
          <RoleIcons playstyles={playstyles} />
        </Table.Cell>
        <Table.Cell style={{ borderStyle: "hidden" }}>
          <VCIcon canVC={freeAgent.can_vc} />
        </Table.Cell>
        <Table.Cell style={{ borderStyle: "hidden" }}>
          {freeAgent.discord_user.top500 && (
            <Link to={`/u/${freeAgent.discord_user.discord_id}?tab=1`}>
              <img
                src={top500}
                style={{ width: "40px", height: "auto" }}
                alt="top 500"
              />
            </Link>
          )}
        </Table.Cell>
      </Table.Row>
      {expanded && <TextRows freeAgent={freeAgent} />}
    </>
  )
}

export default FATableRows
