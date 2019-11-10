import React, { useState, useEffect, useRef } from "react"
import { useQuery } from "@apollo/react-hooks"
import { maplists } from "../../graphql/queries/maplists"
import Loading from "../common/Loading"
import Error from "../common/Error"
import {
  Divider,
  Header,
  Icon,
  Form,
  Checkbox,
  Grid,
  Image,
  List,
  Input,
  Label,
  Button
} from "semantic-ui-react"
import szIcon from "../../assets/sz.png"
import tcIcon from "../../assets/tc.png"
import rmIcon from "../../assets/rm.png"
import cbIcon from "../../assets/cb.png"

const MapListGenerator = () => {
  const { data, error, loading } = useQuery(maplists)
  const [maps, setMaps] = useState([])
  const [boxValue, setBoxValue] = useState(0)
  const [mapValues, setMapValues] = useState([])
  const [amountToGenerate, setAmountToGenerate] = useState(12)
  const [generatedMaps, setGeneratedMaps] = useState([])
  const [generationType, setGenerationType] = useState("rotate")
  const [copySuccess, setCopySuccess] = useState("")
  const textAreaRef = useRef(null)

  useEffect(() => {
    if (loading || error) {
      return
    }
    document.title = "Maplist Generator - sendou.ink"
    setMaps(data.maplists)

    setMapValues(
      data.maplists.reduce((acc, cur) => {
        return acc.concat({
          sz: new Array(cur.sz.length).fill(true),
          tc: new Array(cur.tc.length).fill(true),
          rm: new Array(cur.rm.length).fill(true),
          cb: new Array(cur.cb.length).fill(true)
        })
      }, [])
    )
  }, [data, loading, error])

  if (loading || maps.length === 0) return <Loading />

  if (error) return <Error errorMessage={error.message} />

  function copyToClipboard(e) {
    textAreaRef.current.select()
    document.execCommand("copy")
    e.target.focus()
    setCopySuccess("Copied!")
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const generateRandomMapPool = () => {
    const szMaps = maps[boxValue].sz.filter((m, i) => mapValues[boxValue].sz[i])
    const tcMaps = maps[boxValue].tc.filter((m, i) => mapValues[boxValue].tc[i])
    const rmMaps = maps[boxValue].rm.filter((m, i) => mapValues[boxValue].rm[i])
    const cbMaps = maps[boxValue].cb.filter((m, i) => mapValues[boxValue].cb[i])
    if (szMaps.length + tcMaps.length + rmMaps.length + cbMaps.length === 0) {
      return
    }

    let mapsWithModes = [
      ...szMaps.map(m => `Splat Zones - ${m}`),
      ...tcMaps.map(m => `Tower Control - ${m}`),
      ...rmMaps.map(m => `Rainmaker - ${m}`),
      ...cbMaps.map(m => `Clam Blitz - ${m}`)
    ]
    const toSetAsState = []
    let usedMaps = []
    shuffle(mapsWithModes)

    for (let i = amountToGenerate; i > 0; i--) {
      if (mapsWithModes.length === 0) {
        shuffle(usedMaps)
        mapsWithModes = [...usedMaps]
        usedMaps = []
      }
      const modeMap = mapsWithModes.pop()
      toSetAsState.push(`${toSetAsState.length + 1}) ${modeMap}`)
      usedMaps.push(modeMap)
    }

    setGeneratedMaps(toSetAsState)
  }

  const generateEvenMapPool = (szEveryOther = false) => {
    const szMaps = maps[boxValue].sz.filter((m, i) => mapValues[boxValue].sz[i])
    const tcMaps = maps[boxValue].tc.filter((m, i) => mapValues[boxValue].tc[i])
    const rmMaps = maps[boxValue].rm.filter((m, i) => mapValues[boxValue].rm[i])
    const cbMaps = maps[boxValue].cb.filter((m, i) => mapValues[boxValue].cb[i])

    if (szMaps.length + tcMaps.length + rmMaps.length + cbMaps.length === 0) {
      return
    }

    let szMapMode = [...szMaps.map(m => `Splat Zones - ${m}`)]
    let usedSz = []
    let tcMapMode = [...tcMaps.map(m => `Tower Control - ${m}`)]
    let usedTc = []
    let rmMapMode = [...rmMaps.map(m => `Rainmaker - ${m}`)]
    let usedRm = []
    let cbMapMode = [...cbMaps.map(m => `Clam Blitz - ${m}`)]
    let usedCb = []
    const toSetAsState = []

    let modes = []
    if (szMapMode.length !== 0) {
      shuffle(szMapMode)
    }
    if (tcMapMode.length !== 0) {
      modes.push("TOWER CONTROL")
      shuffle(tcMapMode)
    }
    if (cbMapMode.length !== 0) {
      modes.push("CLAM BLITZ")
      shuffle(cbMapMode)
    }
    if (rmMapMode.length !== 0) {
      modes.push("RAINMAKER")
      shuffle(rmMapMode)
    }

    let szRemainder = modes.length + 1
    if (szEveryOther) {
      szRemainder = 2
      shuffle(modes) //not shuffled if sz->tc->cb->rm for host convenience
    }

    for (let i = amountToGenerate; i > 0; i--) {
      // replenishing map mode lists when half are used
      if (usedSz.length >= szMapMode.length && usedSz.length !== 0) {
        shuffle(usedSz)
        szMapMode = szMapMode.concat(usedSz)
        usedSz = []
      } else if (usedTc.length >= tcMapMode.length && usedTc.length !== 0) {
        shuffle(usedTc)
        tcMapMode = tcMapMode.concat(usedTc)
        usedTc = []
      } else if (usedRm.length >= rmMapMode.length && usedRm.length !== 0) {
        shuffle(usedRm)
        rmMapMode = rmMapMode.concat(usedRm)
        usedRm = []
      } else if (usedCb.length >= cbMapMode.length && usedCb.length !== 0) {
        shuffle(usedCb)
        cbMapMode = cbMapMode.concat(usedCb)
        usedCb = []
      }

      if (i % szRemainder === 0 && szMapMode.length !== 0) {
        //latter check is for if user selected 0 sz maps
        const modeMap = szMapMode.shift()
        toSetAsState.push(`${toSetAsState.length + 1}) ${modeMap}`)
        usedSz.push(modeMap)
        continue
      }

      if (modes[0] === "TOWER CONTROL" && tcMapMode.length !== 0) {
        const modeMap = tcMapMode.shift()
        toSetAsState.push(`${toSetAsState.length + 1}) ${modeMap}`)
        usedTc.push(modeMap)
        modes.push(modes.splice(0, 1)[0]) // move the mode to last
        continue
      }

      if (modes[0] === "RAINMAKER" && rmMapMode.length !== 0) {
        const modeMap = rmMapMode.shift()
        toSetAsState.push(`${toSetAsState.length + 1}) ${modeMap}`)
        usedRm.push(modeMap)
        modes.push(modes.splice(0, 1)[0])
        continue
      }

      if (modes[0] === "CLAM BLITZ" && cbMapMode.length !== 0) {
        const modeMap = cbMapMode.shift()
        toSetAsState.push(`${toSetAsState.length + 1}) ${modeMap}`)
        usedCb.push(modeMap)
        modes.push(modes.splice(0, 1)[0])
      }
    }

    setGeneratedMaps(toSetAsState)
  }

  return (
    <>
      <Divider horizontal>
        <Header as="h4">
          <Icon name="map" />
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
                name="map"
                checked={i === boxValue}
                onChange={() => setBoxValue(i)}
              />
            </Form.Field>
          )
        })}
      </Form>
      <div>
        <Divider horizontal>
          <Header as="h4">
            <Icon name="checkmark box" />
            Choose the maps to include
          </Header>
        </Divider>
        <Grid relaxed="very" columns={4} stackable>
          <Grid.Column>
            <Image src={szIcon} size="tiny" />
            <br />
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
            <Image src={tcIcon} size="tiny" />
            <br />
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
            <Image src={rmIcon} size="tiny" />
            <br />
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
            <Image src={cbIcon} size="tiny" />
            <br />
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
      <div style={{ paddingTop: "5px" }}>
        <Divider horizontal>
          <Header as="h4">
            <Icon name="clipboard list" />
            Set the final preferences & generate!
          </Header>
        </Divider>
        <Input
          type="number"
          placeholder="Choose amount"
          label="Choose the amount of maps to generate"
          value={amountToGenerate}
          onChange={e => setAmountToGenerate(e.target.value)}
          error={amountToGenerate < 1 || amountToGenerate > 100}
        />
        {amountToGenerate < 1 || amountToGenerate > 100 ? (
          <Label basic color="red" pointing="left">
            Amount of maps to generate has to be between 1 and 100
          </Label>
        ) : null}
      </div>
      <div style={{ paddingTop: "5px" }}>
        <Form.Field>
          <Checkbox
            radio
            label="Rotate mode SZ->TC->CB->RM"
            name="rotateMode"
            checked={generationType === "rotate"}
            onChange={() => setGenerationType("rotate")}
          />
          <br />
          <Checkbox
            radio
            label="SZ every other map"
            name="szEveryOther"
            checked={generationType === "everyOther"}
            onChange={() => setGenerationType("everyOther")}
          />
          <br />
          <Checkbox
            radio
            label="Total randomness"
            name="random"
            checked={generationType === "random"}
            onChange={() => setGenerationType("random")}
          />
        </Form.Field>
      </div>
      <div style={{ paddingTop: "10px" }}>
        <Button
          disabled={amountToGenerate < 1 || amountToGenerate > 100}
          onClick={() => {
            generationType === "random"
              ? generateRandomMapPool()
              : generateEvenMapPool(generationType === "everyOther")
          }}
        >
          Go!
        </Button>
      </div>
      <div style={{ paddingTop: "5px" }}>
        {generatedMaps.length !== 0 ? (
          <div>
            <textarea
              rows={generatedMaps.length + 2}
              style={{ resize: "none", width: "300px" }}
              readOnly
              value={generatedMaps.join("\n")}
              ref={textAreaRef}
            />
            <br />
            {document.queryCommandSupported("copy") && (
              <div>
                <Button onClick={copyToClipboard}>
                  Copy maps to clipboard
                </Button>
                {copySuccess}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  )
}

export default MapListGenerator
