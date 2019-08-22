import React, { useEffect, useState } from "react"
import { useQuery } from "@apollo/react-hooks"
import { useSelector } from "react-redux"
import { rotationData } from "../../graphql/queries/rotationData"
import { maplists } from "../../graphql/queries/maplists"
import {
  Loader,
  Segment,
  Header,
  Grid,
  Image,
  Popup,
  Button,
  Checkbox
} from "semantic-ui-react"

import arowana_mall from "../../img/mapIcons/arowana_mall.png"
import anchov_games from "../../img/mapIcons/ancho-v_games.png"
import blackbelly_skatepark from "../../img/mapIcons/blackbelly_skatepark.png"
import camp_triggerfish from "../../img/mapIcons/camp_triggerfish.png"
import goby_arena from "../../img/mapIcons/goby_arena.png"
import humpback_pump_track from "../../img/mapIcons/humpback_pump_track.png"
import inkblot_art_academy from "../../img/mapIcons/inkblot_art_academy.png"
import kelp_dome from "../../img/mapIcons/kelp_dome.png"
import makomart from "../../img/mapIcons/makomart.png"
import manta_maria from "../../img/mapIcons/manta_maria.png"
import moray_towers from "../../img/mapIcons/moray_towers.png"
import musselforge_fitness from "../../img/mapIcons/musselforge_fitness.png"
import new_albacore_hotel from "../../img/mapIcons/new_albacore_hotel.png"
import piranha_pit from "../../img/mapIcons/piranha_pit.png"
import port_mackerel from "../../img/mapIcons/port_mackerel.png"
import shellendorf_institute from "../../img/mapIcons/shellendorf_institute.png"
import skipper_pavilion from "../../img/mapIcons/skipper_pavilion.png"
import snapper_canal from "../../img/mapIcons/snapper_canal.png"
import starfish_mainstage from "../../img/mapIcons/starfish_mainstage.png"
import sturgeon_shipyard from "../../img/mapIcons/sturgeon_shipyard.png"
import the_reef from "../../img/mapIcons/the_reef.png"
import wahoo_world from "../../img/mapIcons/wahoo_world.png"
import walleye_warehouse from "../../img/mapIcons/walleye_warehouse.png"
import rankedIcon from "../../img/modeIcons/ranked.png"
import regularIcon from "../../img/modeIcons/regular.png"
import leagueIcon from "../../img/modeIcons/league.png"
import szIcon from "../../img/modeIcons/sz.png"
import tcIcon from "../../img/modeIcons/tc.png"
import rmIcon from "../../img/modeIcons/rm.png"
import cbIcon from "../../img/modeIcons/cb.png"

const mapIcons = {
  "Arowana Mall": arowana_mall,
  "Ancho-V Games": anchov_games,
  "Blackbelly Skatepark": blackbelly_skatepark,
  "Camp Triggerfish": camp_triggerfish,
  "Goby Arena": goby_arena,
  "Humpback Pump Track": humpback_pump_track,
  "Inkblot Art Academy": inkblot_art_academy,
  "Kelp Dome": kelp_dome,
  MakoMart: makomart,
  "Manta Maria": manta_maria,
  "Moray Towers": moray_towers,
  "Musselforge Fitness": musselforge_fitness,
  "New Albacore Hotel": new_albacore_hotel,
  "Piranha Pit": piranha_pit,
  "Port Mackerel": port_mackerel,
  "Shellendorf Institute": shellendorf_institute,
  "Skipper Pavilion": skipper_pavilion,
  "Snapper Canal": snapper_canal,
  "Starfish Mainstage": starfish_mainstage,
  "Sturgeon Shipyard": sturgeon_shipyard,
  "The Reef": the_reef,
  "Wahoo World": wahoo_world,
  "Walleye Warehouse": walleye_warehouse
}

const modeIcons = {
  "Splat Zones": szIcon,
  "Tower Control": tcIcon,
  Rainmaker: rmIcon,
  "Clam Blitz": cbIcon
}

const modeShort = {
  "Splat Zones": "sz",
  "Tower Control": "tc",
  Rainmaker: "rm",
  "Clam Blitz": "cb"
}

// TODO: Salmon Run rotations
const PageRotations = ({ setMenuSelection }) => {
  const { data, error, loading } = useQuery(rotationData)
  const monthly = useQuery(maplists)
  const [rotation, setRotation] = useState([])
  const [preferences, setPreferences] = useState({
    sz: {},
    tc: {},
    rm: {},
    cb: {}
  })

  const [show, setShow] = useState(false)
  const [currentTime, setCurrentTime] = useState(
    new Date(Math.floor(Date.now() / 1000))
  )
  const localization = useSelector(state => state.localization)

  useEffect(() => {
    if (loading || monthly.loading) {
      return
    }

    const rotationPreferencesFromDb = window.localStorage.getItem(
      "rotationPreferences"
    )
    if (rotationPreferencesFromDb) {
      setPreferences(JSON.parse(rotationPreferencesFromDb))
    }

    setRotation(JSON.parse(data.rotationData))
  }, [data, loading, monthly.loading])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentTime(new Date(Math.floor(Date.now() / 1000)))
    }, 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [currentTime])

  useEffect(() => {
    setMenuSelection("rotations")
    document.title = "Rotations - sendou.ink"
  }, [setMenuSelection])

  if (loading || monthly.loading || rotation.length === 0) {
    return (
      <div style={{ paddingTop: "25px", paddingBottom: "20000px" }}>
        <Loader active inline="centered" />
      </div>
    )
  }
  if (error || monthly.error) {
    return (
      <div style={{ color: "red" }}>
        {error ? error.message : null}{" "}
        {monthly.error ? monthly.error.message : null}
      </div>
    )
  }

  const monthlyMaps = monthly.data.maplists[0]

  return (
    <div>
      <div>
        <Button icon="cog" onClick={() => setShow(!show)} />
        {show ? (
          <Segment>
            <div style={{ padding: "5px" }}>
              {
                localization[
                  "Uncheck a map in the ranked rotation to mark it as a disliked map."
                ]
              }
              <Grid relaxed columns={4}>
                <Grid.Column>
                  <b>{localization["Splat Zones"]}</b>
                  {monthlyMaps.sz.map(m => {
                    return (
                      <div key={m}>
                        <Checkbox
                          label={localization[m]}
                          checked={!preferences.sz[m]}
                          onChange={() => {
                            preferences.sz[m] = !preferences.sz[m]
                            window.localStorage.setItem(
                              "rotationPreferences",
                              JSON.stringify(preferences)
                            )
                          }}
                        />
                        <br />
                      </div>
                    )
                  })}
                </Grid.Column>
                <Grid.Column>
                  <b>{localization["Tower Control"]}</b>
                  {monthlyMaps.tc.map(m => {
                    return (
                      <div key={m}>
                        <Checkbox
                          label={localization[m]}
                          checked={!preferences.tc[m]}
                          onChange={() => {
                            preferences.tc[m] = !preferences.tc[m]
                            window.localStorage.setItem(
                              "rotationPreferences",
                              JSON.stringify(preferences)
                            )
                          }}
                        />
                        <br />
                      </div>
                    )
                  })}
                </Grid.Column>
                <Grid.Column>
                  <b>{localization["Rainmaker"]}</b>
                  {monthlyMaps.rm.map(m => {
                    return (
                      <div key={m}>
                        <Checkbox
                          label={localization[m]}
                          checked={!preferences.rm[m]}
                          onChange={() => {
                            preferences.rm[m] = !preferences.rm[m]
                            window.localStorage.setItem(
                              "rotationPreferences",
                              JSON.stringify(preferences)
                            )
                          }}
                        />
                        <br />
                      </div>
                    )
                  })}
                </Grid.Column>
                <Grid.Column>
                  <b>{localization["Clam Blitz"]}</b>
                  {monthlyMaps.cb.map(m => {
                    return (
                      <div key={m}>
                        <Checkbox
                          label={localization[m]}
                          checked={!preferences.cb[m]}
                          onChange={() => {
                            preferences.cb[m] = !preferences.cb[m]
                            window.localStorage.setItem(
                              "rotationPreferences",
                              JSON.stringify(preferences)
                            )
                          }}
                        />
                        <br />
                      </div>
                    )
                  })}
                </Grid.Column>
              </Grid>
            </div>
          </Segment>
        ) : null}
      </div>
      <div>
        {rotation.gachi.map((r, i) => {
          //league maps references like so: rotation.league[i] - turf: rotation.normal[i]
          if (r.end_time < currentTime) {
            return null
          }
          const timeUntil = r.start_time - currentTime
          const hours = Math.floor(timeUntil / 3600)
          const minutes = Math.floor((timeUntil % 3600) / 60)
          let header = localization["Current"]
          if (r.start_time > currentTime) {
            header = localization.formatString(
              localization["Rotation header"],
              {
                hours,
                minutes,
                date: new Date(r.start_time * 1000).toLocaleString("en-GB")
              }
            )
          }
          return (
            <div key={r.start_time} style={{ paddingTop: "25px" }}>
              <Header
                size="small"
                style={{color: "white", textShadow: "1px 1px black"}}
                disabled={
                  preferences[modeShort[r.rule.name]][r.stage_a.name] &&
                  preferences[modeShort[r.rule.name]][r.stage_b.name]
                }
              >
                {header}
              </Header>
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
                        <Image
                          src={leagueIcon}
                          style={{ paddingBottom: "10px" }}
                        />{" "}
                        LEAGUE
                        <Header.Subheader style={{ paddingTop: "10px" }}>
                          <Image
                            size="mini"
                            src={modeIcons[rotation.league[i].rule.name]}
                            avatar
                          />
                          <b>{localization[rotation.league[i].rule.name]}</b>
                        </Header.Subheader>
                      </Header>
                    </Grid.Column>
                    <Grid.Column>
                      <Header textAlign="center">
                        <Image
                          src={rankedIcon}
                          style={{ paddingBottom: "10px" }}
                        />{" "}
                        RANKED
                        <Header.Subheader style={{ paddingTop: "10px" }}>
                          <Image
                            size="mini"
                            src={modeIcons[r.rule.name]}
                            avatar
                          />
                          <b>{localization[r.rule.name]}</b>
                        </Header.Subheader>
                      </Header>
                    </Grid.Column>
                    <Grid.Column>
                      <Header textAlign="center">
                        <Image
                          src={regularIcon}
                          style={{ paddingBottom: "10px" }}
                        />
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
                          content={
                            localization[rotation.league[i].stage_a.name]
                          }
                          basic
                        />
                        <Popup
                          trigger={
                            <Image
                              src={mapIcons[rotation.league[i].stage_b.name]}
                              rounded
                            />
                          }
                          content={
                            localization[rotation.league[i].stage_b.name]
                          }
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
                                preferences[modeShort[r.rule.name]][
                                  r.stage_a.name
                                ]
                              }
                            />
                          }
                          content={localization[r.stage_a.name]}
                          basic
                        />
                        <Popup
                          trigger={
                            <Image
                              src={mapIcons[r.stage_b.name]}
                              rounded
                              disabled={
                                preferences[modeShort[r.rule.name]][
                                  r.stage_b.name
                                ]
                              }
                            />
                          }
                          content={localization[r.stage_b.name]}
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
                          content={
                            localization[rotation.regular[i].stage_a.name]
                          }
                          basic
                        />
                        <Popup
                          trigger={
                            <Image
                              src={mapIcons[rotation.regular[i].stage_b.name]}
                              rounded
                            />
                          }
                          content={
                            localization[rotation.regular[i].stage_b.name]
                          }
                          basic
                        />
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Segment>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PageRotations
