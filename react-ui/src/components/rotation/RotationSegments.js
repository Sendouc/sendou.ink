import React, { useState, useEffect } from "react"
import { Divider, Header, Segment, Grid, Image, Popup } from "semantic-ui-react"

import { mapIcons, modeIcons } from "../../assets/imageImports"
import rankedIcon from "../../assets/ranked.png"
import leagueIcon from "../../assets/league.png"
import regularIcon from "../../assets/regular.png"

const modeShort = {
  "Splat Zones": "sz",
  "Tower Control": "tc",
  Rainmaker: "rm",
  "Clam Blitz": "cb"
}

const RotationSegments = ({ rotation, preferences }) => {
  const [currentTime, setCurrentTime] = useState(
    new Date(Math.floor(Date.now() / 1000))
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentTime(new Date(Math.floor(Date.now() / 1000)))
    }, 10000)
    return () => {
      clearTimeout(timeout)
    }
  }, [currentTime])

  return rotation.gachi.map((r, i) => {
    //league maps references like so: rotation.league[i] - turf: rotation.normal[i]
    if (r.end_time < currentTime) {
      return null
    }
    const timeUntil = r.start_time - currentTime
    const hours = Math.floor(timeUntil / 3600)
    const minutes = Math.floor((timeUntil % 3600) / 60)
    let header = "Current"
    if (currentTime < r.start_time) {
      header = `In ${hours}h ${minutes}min (${new Date(
        r.start_time * 1000
      ).toLocaleString("en-GB")})`
    }
    return (
      <div key={r.start_time} style={{ margin: "1.5em 0 1.5em 0" }}>
        <Divider horizontal>
          <Header as="h4">{header}</Header>
        </Divider>
        <Segment
          disabled={
            preferences[modeShort[r.rule.name]][r.stage_a.name] &&
            preferences[modeShort[r.rule.name]][r.stage_b.name]
          }
          raised
        >
          <Grid columns={3} stackable>
            <Grid.Row>
              <Grid.Column>
                <Header textAlign="center">
                  <Image src={leagueIcon} style={{ paddingBottom: "10px" }} />{" "}
                  LEAGUE
                  <Header.Subheader style={{ paddingTop: "10px" }}>
                    <Image
                      size="mini"
                      src={modeIcons[rotation.league[i].rule.name]}
                      avatar
                    />
                    <b>{rotation.league[i].rule.name}</b>
                  </Header.Subheader>
                </Header>
              </Grid.Column>
              <Grid.Column>
                <Header textAlign="center">
                  <Image src={rankedIcon} style={{ paddingBottom: "10px" }} />{" "}
                  RANKED
                  <Header.Subheader style={{ paddingTop: "10px" }}>
                    <Image size="mini" src={modeIcons[r.rule.name]} avatar />
                    <b>{r.rule.name}</b>
                  </Header.Subheader>
                </Header>
              </Grid.Column>
              <Grid.Column>
                <Header textAlign="center">
                  <Image src={regularIcon} style={{ paddingBottom: "10px" }} />
                  REGULAR
                  <Header.Subheader style={{ paddingTop: "10px" }} />{" "}
                  {/*this is needed for formatting reasons.*/}
                </Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Popup
                    trigger={
                      <Image
                        src={mapIcons[rotation.league[i].stage_a.name]}
                        rounded
                      />
                    }
                    content={rotation.league[i].stage_a.name}
                    basic
                  />
                  <Popup
                    trigger={
                      <Image
                        src={mapIcons[rotation.league[i].stage_b.name]}
                        rounded
                      />
                    }
                    content={rotation.league[i].stage_b.name}
                    basic
                  />
                </div>
              </Grid.Column>
              <Grid.Column>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Popup
                    trigger={
                      <Image
                        src={mapIcons[r.stage_a.name]}
                        rounded
                        disabled={
                          preferences[modeShort[r.rule.name]][r.stage_a.name]
                        }
                      />
                    }
                    content={r.stage_a.name}
                    basic
                  />
                  <Popup
                    trigger={
                      <Image
                        src={mapIcons[r.stage_b.name]}
                        rounded
                        disabled={
                          preferences[modeShort[r.rule.name]][r.stage_b.name]
                        }
                      />
                    }
                    content={r.stage_b.name}
                    basic
                  />
                </div>
              </Grid.Column>
              <Grid.Column>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Popup
                    trigger={
                      <Image
                        src={mapIcons[rotation.regular[i].stage_a.name]}
                        rounded
                      />
                    }
                    content={rotation.regular[i].stage_a.name}
                    basic
                  />
                  <Popup
                    trigger={
                      <Image
                        src={mapIcons[rotation.regular[i].stage_b.name]}
                        rounded
                      />
                    }
                    content={rotation.regular[i].stage_b.name}
                    basic
                  />
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  })
}

export default RotationSegments
