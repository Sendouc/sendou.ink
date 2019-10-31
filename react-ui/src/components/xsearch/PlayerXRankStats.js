import React, { useEffect, useState } from "react"
import { useQuery } from "@apollo/react-hooks"
import { Header, Image, Icon, List, Segment } from "semantic-ui-react"
import { Link, Redirect, useParams } from "react-router-dom"

import { playerInfo } from "../../graphql/queries/playerInfo"
import TopPlacementsTable from "./TopPlacementsTable"
import WpnPlayedTable from "./WpnPlayedTable"
import MonthsTable from "./MonthsTable"
import Loading from "../common/Loading"
import Error from "../common/Error"

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

const PlayerXRankStats = ({ twitter, tabMode = false }) => {
  let searchVariables = {}
  const { uid } = useParams()
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
    if (data && data.playerInfo) {
      document.title = `${data.playerInfo.player.name} - X Rank - sendou.ink`
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
  }, [data, loading])

  if (!uid && !twitter) return addXRankHelp
  if (loading) return <Loading />
  if (error) {
    if (error.message === "GraphQL error: player not found") {
      if (tabMode) return addXRankHelp
      else return <Redirect to="/404" />
    }
    return <Error errorMessage={error.message} />
  }
  const playerData = data.playerInfo.player
  return (
    <>
      {!tabMode ? (
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
      {!tabMode && playerData.discord_id ? (
        <>
          <Link to={`/u/${playerData.discord_id}`}>User page</Link>
          <br />
        </>
      ) : null}
      <Segment compact>
        <div style={{ padding: "5px" }}>
          <TopPlacementsTable top={top} />
        </div>
      </Segment>
      <Segment compact>
        <div style={{ padding: "5px" }}>
          <Header dividing>All Top 500 placements</Header>
          <MonthsTable placements={data.playerInfo.placements} />
        </div>
      </Segment>
      <Segment compact>
        <div style={{ padding: "5px" }}>
          <Header dividing>Weapons reached Top 500 with</Header>
          <WpnPlayedTable weapons={playerData.weapons} />
        </div>
      </Segment>
    </>
  )
}
export default PlayerXRankStats
