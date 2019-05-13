import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo-hooks'
import { rotationData } from '../../graphql/queries/rotationData'
import { Loader, Segment, Header, Grid, Image, Popup } from 'semantic-ui-react'

import arowana_mall from '../img/mapIcons/arowana_mall.png'
import anchov_games from '../img/mapIcons/ancho-v_games.png'
import blackbelly_skatepark from '../img/mapIcons/blackbelly_skatepark.png'
import camp_triggerfish from '../img/mapIcons/camp_triggerfish.png'
import goby_arena from '../img/mapIcons/goby_arena.png'
import humpback_pump_track from '../img/mapIcons/humpback_pump_track.png'
import inkblot_art_academy from '../img/mapIcons/inkblot_art_academy.png'
import kelp_dome from '../img/mapIcons/kelp_dome.png'
import makomart from '../img/mapIcons/makomart.png'
import manta_maria from '../img/mapIcons/manta_maria.png'
import moray_towers from '../img/mapIcons/moray_towers.png'
import musselforge_fitness from '../img/mapIcons/musselforge_fitness.png'
import new_albacore_hotel from '../img/mapIcons/new_albacore_hotel.png'
import piranha_pit from '../img/mapIcons/piranha_pit.png'
import port_mackerel from '../img/mapIcons/port_mackerel.png'
import shellendorf_institute from '../img/mapIcons/shellendorf_institute.png'
import skipper_pavilion from '../img/mapIcons/skipper_pavilion.png'
import snapper_canal from '../img/mapIcons/snapper_canal.png'
import starfish_mainstage from '../img/mapIcons/starfish_mainstage.png'
import sturgeon_shipyard from '../img/mapIcons/sturgeon_shipyard.png'
import the_reef from '../img/mapIcons/the_reef.png'
import wahoo_world from '../img/mapIcons/wahoo_world.png'
import walleye_warehouse from '../img/mapIcons/walleye_warehouse.png'
import rankedIcon from '../img/modeIcons/ranked.png'
import regularIcon from '../img/modeIcons/regular.png'
import leagueIcon from '../img/modeIcons/league.png'
import szIcon from '../img/modeIcons/sz.png'
import tcIcon from '../img/modeIcons/tc.png'
import rmIcon from '../img/modeIcons/rm.png'
import cbIcon from '../img/modeIcons/cb.png'

const mapIcons = {
  "Arowana Mall": arowana_mall,
  "Ancho-V Games": anchov_games,
  "Blackbelly Skatepark": blackbelly_skatepark,
  "Camp Triggerfish": camp_triggerfish,
  "Goby Arena": goby_arena,
  "Humpback Pump Track": humpback_pump_track,
  "Inkblot Art Academy": inkblot_art_academy,
  "Kelp Dome": kelp_dome,
  "MakoMart": makomart,
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
  "Rainmaker": rmIcon,
  "Clam Blitz": cbIcon
}

const modeShort = {
  "Splat Zones": "SZ",
  "Tower Control": "TC",
  "Rainmaker": "RM",
  "Clam Blitz": "CB"
}

const Rotations = ({ setMenuSelection }) => {
  const { data, error, loading } = useQuery(rotationData)
  const [ rotation, setRotation ] = useState([])
  const [ currentTime, setCurrentTime ] = useState(new Date(Math.floor(Date.now() / 1000)))
  useEffect(() => {
    if (loading) {
      return
    }
    setMenuSelection('rotations')
    document.title = 'Maplist Generator - sendou.ink'
    setRotation(JSON.parse(data.rotationData))

  }, [data, loading, setMenuSelection])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentTime(new Date(Math.floor(Date.now() / 1000)))
    }, 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [currentTime])

  if (loading || rotation.length === 0) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }
  if (error) {
    return <div style={{"color": "red"}}>{error.message}</div>
  }
  console.log(rotation)
  console.log(currentTime)

  return (
    <div>
      {rotation.gachi.map((r, i) => { //league maps references like so: rotation.league[i] - turf: rotation.normal[i]
        if (r.end_time < currentTime) {
          return null
        }
        const timeUntil = r.start_time - currentTime
        const hours = Math.floor(timeUntil / 3600)
        const minutes = Math.floor((timeUntil % 3600) / 60)
        const seconds = timeUntil % 3600 % 60
        let header = 'Current'
        if (hours >= 2) {
          header = `In ${hours} hours ${minutes} minutes (${new Date(r.start_time * 1000).toLocaleString('en-GB')})`
        } else if (hours > 0) {
          header = `In ${hours} hours ${minutes} minutes ${seconds} seconds`
        } else if (minutes > 0) {
          header = `In ${minutes} minutes ${seconds} seconds`
        }
        return (
          <div key={r.start_time} style={{"paddingTop": "25px"}}>
            <Header size='small' disabled={r.rule.name === 'Clam Blitz'}>{header}</Header>
            <Segment inverted disabled={r.rule.name === 'Clam Blitz'}>
            <Grid columns={3} stackable>
              <Grid.Row>
                <Grid.Column>
                  <Header textAlign='center' inverted>
                    <Image src={leagueIcon} style={{"paddingBottom": "10px"}}/> LEAGUE
                    <Header.Subheader style={{"paddingTop": "10px"}}><Image size="mini" src={modeIcons[rotation.league[i].rule.name]} avatar/>{rotation.league[i].rule.name}</Header.Subheader>
                  </Header>
                </Grid.Column>
                <Grid.Column>
                  <Header textAlign='center' inverted>
                    <Image src={rankedIcon} style={{"paddingBottom": "10px"}}/> RANKED
                    <Header.Subheader style={{"paddingTop": "10px"}}><Image size="mini" src={modeIcons[r.rule.name]} avatar/>{r.rule.name}</Header.Subheader>
                  </Header> 
                </Grid.Column>
                <Grid.Column>
                  <Header textAlign='center' inverted>
                    <Image src={regularIcon} style={{"paddingBottom": "10px"}}/>REGULAR
                    <Header.Subheader style={{"paddingTop": "10px"}}></Header.Subheader> {/*this is needed for formatting reasons.*/}
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
                    <Popup
                      trigger={<Image 
                        src={mapIcons[rotation.league[i].stage_a.name]} 
                        rounded 
                      />}
                      content={rotation.league[i].stage_a.name}
                      basic
                    />
                    <Popup
                      trigger={<Image 
                        src={mapIcons[rotation.league[i].stage_b.name]} 
                        rounded 
                      />}
                      content={rotation.league[i].stage_b.name}
                      basic
                    />
                  </div>
                </Grid.Column>
                <Grid.Column>
                  <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
                    <Popup
                      trigger={<Image 
                        src={mapIcons[r.stage_a.name]}
                        rounded 
                      />}
                      content={r.stage_a.name}
                      basic
                    /> 
                    <Popup
                      trigger={<Image 
                        src={mapIcons[r.stage_b.name]}
                        rounded 
                      />}
                      content={r.stage_b.name}
                      basic
                    /> 
                  </div>
                </Grid.Column>
                <Grid.Column>
                  <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
                    <Popup
                      trigger={<Image 
                        src={mapIcons[rotation.regular[i].stage_a.name]} 
                        rounded 
                      />}
                      content={rotation.regular[i].stage_a.name}
                      basic
                    /> 
                    <Popup
                    trigger={<Image 
                      src={mapIcons[rotation.regular[i].stage_b.name]} 
                      rounded 
                    />}
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
      })}
    </div>
  )
}

export default Rotations