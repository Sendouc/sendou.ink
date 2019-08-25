import React, { useEffect, useState } from "react"
import { useQuery } from "@apollo/react-hooks"
import { Loader, Header, Image, Icon, List, Segment } from "semantic-ui-react"
import { Link } from "react-router-dom"
import { useSelector } from 'react-redux'

import { playerInfo } from "../../graphql/queries/playerInfo"
import TopPlacementTable from "./TopPlacementsTable"
import WpnPlayedTable from "./WpnPlayedTable"
import MonthsTable from "./MonthsTable"

const InfoPlayer = ({ uid, setMenuSelection, twitter }) => {
  const localization = useSelector(state => state.localization)
  let searchVariables = {}
  if (uid) searchVariables = { uid }
  if (twitter) searchVariables = { twitter }
  const { data, error, loading } = useQuery(playerInfo, {
    variables: searchVariables
  })
  const [top, setTop] = useState([])

  useEffect(() => {
    if (loading) {
      return
    }

    if (setMenuSelection) {
      //if we're on /xsearch
      setMenuSelection("search")
    }
    if (data && data.playerInfo) {
      const placements = data.playerInfo.placements

      //reducing placements to top sz, tc etc. rank and x power
      const tops = ["", "szTop", "tcTop", "rmTop", "cbTop"]
      const exs = ["", "szX", "tcX", "rmX", "cbX"]
      setTop(
        placements.reduce(
          (acc, cur) => {
            const topKey = tops[cur.mode]
            const xKey = exs[cur.mode]
            if (!acc[xKey]) {
              acc[xKey] = cur
              acc[topKey] = cur
              return acc
            }
            if (acc[xKey].x_power < cur.x_power) {
              acc[xKey] = cur
            }
            if (acc[topKey].rank > cur.rank) {
              acc[topKey] = cur
            }

            return acc
          },
          {
            szX: null,
            szTop: null,
            tcX: null,
            tcTop: null,
            rmX: null,
            rmTop: null,
            cbX: null,
            cbTop: null
          }
        )
      )
    }
  }, [data, loading, setMenuSelection])

  const addXRankHelp = (
    <div>
      This user has no X Rank profile set up. If you are the owner of this user
      page here is how you can set it up:
      <div style={{ paddingTop: "5px" }}>
        <List ordered>
          <List.Item>
            Finish an X rank season in the Top 500 in at least one mode.
          </List.Item>
          <List.Item>Send your Twitter handle to Sendou via DM.</List.Item>
          <List.Item>
            Add your Twitter account to your profile on Discord, verify it and
            make sure it's set to appear publicly.
          </List.Item>
          <List.Item>Log in to sendou.ink</List.Item>
        </List>
      </div>
    </div>
  )

  if (!uid && !twitter) return addXRankHelp

  if (loading) {
    return (
      <div style={{ paddingTop: "25px", paddingBottom: "20000px" }}>
        <Loader active inline="centered" />
      </div>
    )
  }
  if (error) {
    if (error.message === "GraphQL error: player not found") {
      return addXRankHelp
    }
    return <div style={{ color: "red" }}>{error.message}</div>
  }
  const playerData = data.playerInfo.player

  return (
    <div style={{ paddingTop: "20px" }}>
      {setMenuSelection ? (
        <Header as="h2">
          {playerData.twitter ? (
            <Image
              circular
              src={`https://avatars.io/twitter/${playerData.twitter}`}
            />
          ) : null}{" "}
          {playerData.alias ? playerData.alias : playerData.name}
          {playerData.twitter ? (
            <a href={`https://twitter.com/${playerData.twitter}`}>
              <Icon
                style={{ paddingLeft: "5px" }}
                size="small"
                name="twitter"
              />
            </a>
          ) : null}
        </Header>
      ) : null}
      {setMenuSelection && playerData.discord_id ? (
        <>
          <Link to={`/u/${playerData.discord_id}`}>User page</Link>
          <br />
        </>
      ) : null}
      <Segment compact>
        <div style={{"padding": "5px"}}>
          <TopPlacementTable top={top}/>
        </div>
      </Segment>
      <Segment compact>
        <div style={{"padding": "5px"}}>
          <Header dividing>{localization["All Top 500 placements"]}</Header>
          <MonthsTable placements={data.playerInfo.placements} />
        </div>
      </Segment>
      <Segment compact>
        <div style={{"padding": "5px"}}>
          <Header dividing>{localization["Weapons reached Top 500 with"]}</Header>
          <WpnPlayedTable weapons={playerData.weapons} />
        </div>
      </Segment>
    </div>
  )
}

export default InfoPlayer
