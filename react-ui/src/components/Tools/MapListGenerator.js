import React, { useEffect, useState } from 'react'
import { TextArea, Loader, Checkbox, Form, Header, List, Image, Divider, Icon, Grid, Input, Button, Label } from 'semantic-ui-react'
import { useQuery } from 'react-apollo-hooks'
import { maplists } from '../../graphql/queries/maplists'
import szIcon from '../img/modeIcons/sz.png'
import tcIcon from '../img/modeIcons/tc.png'
import rmIcon from '../img/modeIcons/rm.png'
import cbIcon from '../img/modeIcons/cb.png'

const MapListGenerator = ({ setMenuSelection }) => {
  const { data, error, loading } = useQuery(maplists)
  const [ maps, setMaps ] = useState([])
  const [ boxValue, setBoxValue ] = useState(0)
  const [ mapValues, setMapValues ] = useState([])
  const [ amountToGenerate, setAmountToGenerate ] = useState(12)
  const [ generatedMaps, setGeneratedMaps ] = useState([])

  useEffect(() => {
    if (loading) {
      return
    }
    setMenuSelection('maplists')
    document.title = 'Maplist Generator - sendou.ink'
    setMaps(data.maplists)

    setMapValues(data.maplists.reduce((acc, cur) => {
      return (
        acc.concat({
          sz: new Array(cur.sz.length).fill(true),
          tc: new Array(cur.tc.length).fill(true),
          rm: new Array(cur.rm.length).fill(true),
          cb: new Array(cur.cb.length).fill(true),
        })
      )
    }, []))

  }, [data, loading, setMenuSelection])

  if (loading || maps.length === 0) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }
  if (error) {
    return <div style={{"color": "red"}}>{error.message}</div>
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a
  }

  const generateMapPool = () => {
    const szMaps = maps[boxValue].sz.filter((m, i) => mapValues[boxValue].sz[i])
    const tcMaps = maps[boxValue].tc.filter((m, i) => mapValues[boxValue].tc[i])
    const rmMaps = maps[boxValue].rm.filter((m, i) => mapValues[boxValue].rm[i])
    const cbMaps = maps[boxValue].cb.filter((m, i) => mapValues[boxValue].cb[i])
    let mapsWithModes = [...szMaps.map(m => `Splat Zones on ${m}`),
    ...tcMaps.map(m => `Tower Control on ${m}`), ...rmMaps.map(m => `Rainmaker on ${m}`),
    ...cbMaps.map(m => `Clam Blitz on ${m}`)]
    const toSetAsState = []
    let usedMaps = []
    shuffle(mapsWithModes)
    console.log(mapsWithModes)

    for (let i = amountToGenerate; i > 0; i--) {
      if (mapsWithModes.length > 0) {
        const modeMap = mapsWithModes.pop()
        toSetAsState.push(`${toSetAsState.length+1}) ${modeMap}`)
        usedMaps.push(modeMap)
      } else {
        shuffle(usedMaps)
        mapsWithModes = [...usedMaps]
        usedMaps = []
      }
    }

    setGeneratedMaps(toSetAsState)
  }

  return (
    <div style={{"paddingTop": "5px"}}>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='map' />
          Choose the map pool to use
        </Header>
      </Divider>
      <Form>
        {maps.map((m, i) => {
          return (
            <Form.Field key={m.name}>
              <Checkbox
                radio
                label={m.name}
                name='map'
                checked={i === boxValue}
                onChange={() => setBoxValue(i)}
              />
            </Form.Field>
          )
        })}
      </Form>
      <div>
        <Divider horizontal>
          <Header as='h4'>
            <Icon name='checkmark box' />
            Choose the maps to include
          </Header>
        </Divider>
        <Grid relaxed='very' columns={4}>
          <Grid.Column>
            <Image src={szIcon} size="tiny" /><br />
            <List>
              {maps[boxValue].sz.map((m, i) => {
                return (
                  <List.Item key={m}>
                    <Checkbox 
                      label={m}
                      checked={mapValues[boxValue].sz[i]}
                      onChange={() => {
                        const copy = [...mapValues]
                        copy[boxValue].sz[i] = !copy[boxValue].sz[i]
                        setMapValues(copy)
                      }}
                    />
                  </List.Item>
                )
              })}
            </List>
          </Grid.Column>
          <Grid.Column>
          <Image src={tcIcon} size="tiny" /><br />
            <List>
              {maps[boxValue].tc.map((m, i) => {
                return (
                  <List.Item key={m}>
                    <Checkbox 
                      label={m}
                      checked={mapValues[boxValue].tc[i]}
                      onChange={() => {
                        const copy = [...mapValues]
                        copy[boxValue].tc[i] = !copy[boxValue].tc[i]
                        setMapValues(copy)
                      }}
                    />
                  </List.Item>
                )
              })}
            </List>
          </Grid.Column>
          <Grid.Column>
            <Image src={rmIcon} size="tiny" /><br />
            <List>
              {maps[boxValue].rm.map((m, i) => {
                return (
                  <List.Item key={m}>
                    <Checkbox 
                      label={m}
                      checked={mapValues[boxValue].rm[i]}
                      onChange={() => {
                        const copy = [...mapValues]
                        copy[boxValue].rm[i] = !copy[boxValue].rm[i]
                        setMapValues(copy)
                      }}
                    />
                  </List.Item>
                )
              })}
            </List>
          </Grid.Column>
          <Grid.Column>
            <Image src={cbIcon} size="tiny" /><br />
            <List>
              {maps[boxValue].cb.map((m, i) => {
                return (
                  <List.Item key={m}>
                    <Checkbox 
                      label={m}
                      checked={mapValues[boxValue].cb[i]}
                      onChange={() => {
                        const copy = [...mapValues]
                        copy[boxValue].cb[i] = !copy[boxValue].cb[i]
                        setMapValues(copy)
                      }}
                    />
                  </List.Item>
                )
              })}
            </List>
          </Grid.Column>
        </Grid>
      </div>
      <div style={{"paddingTop": "5px"}}>
        <Divider horizontal>
          <Header as='h4'>
            <Icon name='clipboard list' />
            Choose the amount & generate!
          </Header>
        </Divider>
        <Input 
          type='number' 
          placeholder='Choose amount' 
          label='Choose the amount of maps to generate' 
          value={amountToGenerate}
          onChange={(e) => setAmountToGenerate(e.target.value)}
          error={amountToGenerate < 1 || amountToGenerate > 100}
        />
        {(amountToGenerate < 1 || amountToGenerate > 100) ? <Label basic color='red' pointing='left'>
          Amount of maps to generate has to be between 1 and 100
        </Label> : null}
      </div>
      <div style={{"paddingTop": "10px"}}>
        <Button disabled={amountToGenerate < 1 || amountToGenerate > 100} onClick={generateMapPool}>Go!</Button>
      </div>
      <div>
        {generatedMaps.length !== 0 ? 
          <TextArea 
            rows={generatedMaps.length + 5} 
            style={{"resize": "none", "width": "275px"}} 
            readOnly 
            value={generatedMaps.join("\n")} /> : 
          null
        }
      </div>
    </div>
  )
}

export default MapListGenerator