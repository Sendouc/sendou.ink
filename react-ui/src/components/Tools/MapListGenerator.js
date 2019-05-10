import React, { useEffect, useState } from 'react'
import { TextArea, Loader, Checkbox, Form, Header, List, Image, Divider, Icon, Grid, Input, Button } from 'semantic-ui-react'
import { useQuery } from 'react-apollo-hooks'
import { maplists } from '../../graphql/queries/maplists'
import szIcon from '../img/modeIcons/sz.png'
import tcIcon from '../img/modeIcons/tc.png'
import rmIcon from '../img/modeIcons/rm.png'
import cbIcon from '../img/modeIcons/cb.png'
//<TextArea rows={30} style={{"resize": "none"}} readOnly value="jooooooooooooooo"/>
const MapListGenerator = ({ setMenuSelection }) => {
  const { data, error, loading } = useQuery(maplists)
  const [ maps, setMaps ] = useState([])
  const [ boxValue, setBoxValue ] = useState(0)
  const [ mapValues, setMapValues ] = useState([])
  const [ amountToGenerate, setAmountToGenerate ] = useState(12)

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

  const generateMapPoolString = (mapPoolObject, amount) => {
    const allMaps = [...mapPoolObject.sz, ...mapPoolObject.tc, ...mapPoolObject.rm, ...mapPoolObject.cb]
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
      <div>
        <Input 
          type='number' 
          placeholder='Choose amount' 
          label='Choose the amount of maps to generate' 
          value={amountToGenerate}
          onChange={(e) => setAmountToGenerate(e.target.value)}
          error={amountToGenerate < 1 || amountToGenerate > 100}
        />
      </div>
    </div>
  )
}

export default MapListGenerator