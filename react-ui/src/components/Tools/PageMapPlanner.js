import React, { useState, useEffect, useRef } from "react"
import { SketchField, Tools } from "react-sketch"
import { CirclePicker } from "react-color"
import {
  Dropdown,
  Button,
  Icon,
  Input,
  Grid,
  Label,
  Message,
  Segment
} from "semantic-ui-react"
import { useSelector } from "react-redux"
import weaponDict from "../../utils/english_internal.json"
import useWindowDimensions from "../hooks/useWindowDimensions"

import Select from "../elements/Select"
import academy from "../../img/plannerMaps/academy-sz.png"
import arena from "../../img/plannerMaps/arena-sz.png"
import camp from "../../img/plannerMaps/camp-sz.png"
import canal from "../../img/plannerMaps/canal-sz.png"
import dome from "../../img/plannerMaps/dome-sz.png"
import fitness from "../../img/plannerMaps/fitness-sz.png"
import games from "../../img/plannerMaps/games-sz.png"
import hotel from "../../img/plannerMaps/hotel-sz.png"
import institute from "../../img/plannerMaps/institute-sz.png"
import mainstage from "../../img/plannerMaps/mainstage-sz.png"
import mall from "../../img/plannerMaps/mall-sz.png"
import manta from "../../img/plannerMaps/manta-sz.png"
import mart from "../../img/plannerMaps/mart-sz.png"
import pavilion from "../../img/plannerMaps/pavilion-sz.png"
import pit from "../../img/plannerMaps/pit-sz.png"
import pitrm from "../../img/plannerMaps/pit-rm.png"
import port from "../../img/plannerMaps/port-sz.png"
import pumptrack from "../../img/plannerMaps/pumptrack-sz.png"
import reef from "../../img/plannerMaps/reef-sz.png"
import shipyard from "../../img/plannerMaps/shipyard-sz.png"
import skatepark from "../../img/plannerMaps/skatepark-sz.png"
import towers from "../../img/plannerMaps/towers-sz.png"
import warehouse from "../../img/plannerMaps/warehouse-sz.png"
import world from "../../img/plannerMaps/world-sz.png"

const PageMapPlanner = ({ setMenuSelection }) => {
  let sketch = null
  const { containerWidth } = useWindowDimensions()
  const defaultValue = {
    shadowWidth: 0,
    shadowOffset: 0,
    enableRemoveSelected: false,
    fillWithColor: false,
    fillWithBackgroundColor: false,
    drawings: [],
    canUndo: false,
    canRedo: false,
    controlledSize: false,
    sketchWidth: 600,
    sketchHeight: 600,
    stretched: true,
    stretchedX: false,
    stretchedY: false,
    originX: "left",
    originY: "top",
    expandTools: false,
    expandControls: false,
    expandColors: false,
    expandBack: false,
    expandImages: false,
    expandControlled: false,
    enableCopyPaste: false
  }
  const fileInput = useRef(null)
  const [tool, setTool] = useState(Tools.Pencil)
  const [color, setColor] = useState("#f44336")
  const [weapon, setWeapon] = useState("")
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [text, setText] = useState("")
  const [bg, setBg] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [controlledValue, setControlledValue] = useState(defaultValue)
  const localization = useSelector(state => state.localization)

  useEffect(() => {
    setMenuSelection("plans")
    document.title = "Planner - sendou.ink"
  }, [setMenuSelection])

  // doesn't work properly when coming back from another page - not sure why
  useEffect(() => {
    if (!sketch) {
      return
    }
    setBg(reef)
    sketch.setBackgroundFromDataUrl(reef)
  }, [sketch])

  const tools = [
    {
      key: 1,
      text: localization["Pencil"],
      value: Tools.Pencil,
      icon: "pencil"
    },
    {
      key: 2,
      text: localization["Line"],
      value: Tools.Line,
      icon: "window minimize outline"
    },
    {
      key: 3,
      text: localization["Rectangle"],
      value: Tools.Rectangle,
      icon: "square outline"
    },
    {
      key: 4,
      text: localization["Circle"],
      value: Tools.Circle,
      icon: "circle outline"
    },
    {
      key: 5,
      text: localization["Select"],
      value: Tools.Select,
      icon: "object group outline"
    }
  ]

  const maps = [
    { key: "The Reef", text: localization["The Reef"], value: reef },
    {
      key: "Musselforge Fitness",
      text: localization["Musselforge Fitness"],
      value: fitness
    },
    {
      key: "Starfish Mainstage",
      text: localization["Starfish Mainstage"],
      value: mainstage
    },
    {
      key: "Humpback Pump Track",
      text: localization["Humpback Pump Track"],
      value: pumptrack
    },
    {
      key: "Inkblot Art Academy",
      text: localization["Inkblot Art Academy"],
      value: academy
    },
    {
      key: "Sturgeon Shipyard",
      text: localization["Sturgeon Shipyard"],
      value: shipyard
    },
    { key: "Moray Towers", text: localization["Moray Towers"], value: towers },
    { key: "Port Mackerel", text: localization["Port Mackerel"], value: port },
    { key: "Manta Maria", text: localization["Manta Maria"], value: manta },
    { key: "Kelp Dome", text: localization["Kelp Dome"], value: dome },
    { key: "Snapper Canal", text: localization["Snapper Canal"], value: canal },
    {
      key: "Blackbelly Skatepark",
      text: localization["Blackbelly Skatepark"],
      value: skatepark
    },
    { key: "MakoMart", text: localization["MakoMart"], value: mart },
    {
      key: "Walleye Warehouse",
      text: localization["Walleye Warehouse"],
      value: warehouse
    },
    {
      key: "Shellendorf Institute",
      text: localization["Shellendorf Institute"],
      value: institute
    },
    { key: "Arowana Mall", text: localization["Arowana Mall"], value: mall },
    { key: "Goby Arena", text: localization["Goby Arena"], value: arena },
    { key: "Piranha Pit", text: localization["Piranha Pit"], value: pit },
    {
      key: "Piranha Pit (RM)",
      text: localization["Piranha Pit (RM)"],
      value: pitrm
    },
    {
      key: "Camp Triggerfish",
      text: localization["Camp Triggerfish"],
      value: camp
    },
    { key: "Wahoo World", text: localization["Wahoo World"], value: world },
    {
      key: "New Albacore Hotel",
      text: localization["New Albacore Hotel"],
      value: hotel
    },
    { key: "Ancho-V Games", text: localization["Ancho-V Games"], value: games },
    {
      key: "Skipper Pavilion",
      text: localization["Skipper Pavilion"],
      value: pavilion
    }
  ]

  const addImageToSketch = () => {
    sketch.addImg(
      process.env.PUBLIC_URL + `/wpnMedium/Wst_${weaponDict[weapon]}.png`
    )
    setTool(Tools.Select)
  }

  const addTextToSketch = () => {
    sketch.addText(text, {
      fill: color,
      fontFamily: "lato",
      stroke: "#000000",
      strokeWidth: 3,
      paintFirst: "stroke"
    })
    setTool(Tools.Select)
  }

  const undo = () => {
    sketch.undo()
    setCanUndo(sketch.canUndo())
    setCanRedo(sketch.canRedo())
  }

  const redo = () => {
    sketch.redo()
    setCanUndo(sketch.canUndo())
    setCanRedo(sketch.canRedo())
  }

  const removeSelected = () => {
    sketch.removeSelected()
  }

  const onSketchChange = () => {
    let prev = canUndo
    let now = sketch.canUndo()
    if (prev !== now) {
      setCanUndo(now)
    }
  }

  const getDateFormatted = () => {
    const today = new Date()
    const date =
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    const time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    return date + " " + time
  }

  const download = (dataUrl, extension) => {
    let a = document.createElement("a")
    document.body.appendChild(a)
    a.style = "display: none"
    a.href = dataUrl
    a.download = `${
      bg.replace("/static/media/", "").split("-")[0]
    } plans ${getDateFormatted()}.${extension}`
    a.click()
    window.URL.revokeObjectURL(dataUrl)
  }

  const handleUpload = () => {
    if (fileInput.current.files.length === 0) {
      setUploadError("Upload file")
      setTimeout(() => setUploadError(null), 5000)
      return
    }
    const fileObj = fileInput.current.files[0]
    const reader = new FileReader()
    reader.onload = function(event) {
      const jsonObj = JSON.parse(event.target.result)
      setControlledValue(jsonObj)
    }

    reader.readAsText(fileObj)
  }

  const onBgChange = value => {
    sketch.clear()
    setBg(value)
    setCanUndo(false)
    sketch.setBackgroundFromDataUrl(value)
  }

  return (
    <div>
      {containerWidth < 1127 && (
        <Message negative>
          Unfortunately this tool isn't designed for narrow screens but you can
          still give it a go.
        </Message>
      )}
      <SketchField
        name="sketch"
        className="canvas-area"
        ref={c => (sketch = c)}
        lineColor={color}
        lineWidth={5}
        width={1127}
        height={634}
        /*width={
        this.state.controlledSize ? this.state.sketchWidth : null
      }
      height={
        this.state.controlledSize ? this.state.sketchHeight : null
      }*/
        /*defaultValue={dataJson}*/
        value={controlledValue}
        /*forceValue*/
        onChange={onSketchChange}
        tool={tool}
      />
      <Segment>
        <Button primary icon disabled={!canUndo} onClick={() => undo()}>
          <Icon name="undo" /> {localization["Undo"]}
        </Button>
        <Button primary icon disabled={!canRedo} onClick={() => redo()}>
          <Icon name="redo" /> {localization["Redo"]}
        </Button>
        <Button
          primary
          icon
          disabled={tool !== Tools.Select}
          onClick={() => removeSelected()}
        >
          <Icon name="trash" /> {localization["Delete selected"]}
        </Button>
        <Button
          secondary
          icon
          onClick={() => download(sketch.toDataURL(), "png")}
        >
          <Icon name="download" /> {localization["Download as .png"]}
        </Button>
        <Button
          secondary
          icon
          onClick={() =>
            download(
              "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(sketch.toJSON())),
              "json"
            )
          }
        >
          <Icon name="cloud download" /> {localization["Download as .json"]}
        </Button>
        <Button secondary icon onClick={() => handleUpload()}>
          <Icon name="cloud upload" /> {localization["Load from .json"]}
        </Button>
        <input type="file" accept=".json" ref={fileInput} />
        {uploadError && <span style={{ color: "red" }}>{uploadError}</span>}
        <div style={{ paddingTop: "10px" }}>
          <Grid columns={3}>
            <Grid.Column>
              <CirclePicker
                color={color}
                onChangeComplete={newColor => setColor(newColor.hex)}
              />
            </Grid.Column>
            <Grid.Column>
              <h3>{localization["Tools"]}</h3>
              <Dropdown
                onChange={(e, { value }) => setTool(value)}
                options={tools}
                selection
                value={tool}
              />
            </Grid.Column>
            <Grid.Column>
              <h3>{localization["Add text"]}</h3>
              <Input value={text} onChange={e => setText(e.target.value)} />
              <div style={{ paddingTop: "7px" }}>
                <Button
                  icon="plus"
                  circular
                  onClick={() => addTextToSketch()}
                />
              </div>
            </Grid.Column>
          </Grid>
        </div>
        <h3>{localization["Choose the map"]}</h3>
        <Dropdown
          onChange={(e, { value }) => onBgChange(value)}
          options={maps}
          selection
          value={bg}
        />
        <Label basic color="red" pointing="left">
          {
            localization[
              "Please note that changing the map also clears all the drawings"
            ]
          }
        </Label>
        <h3>{localization["Choose a weapon to add"]}</h3>
        <Select content="MAINWEAPONS" value={weapon} onChange={setWeapon} />
        <div style={{ paddingTop: "7px" }}>
          <Button icon="plus" circular onClick={() => addImageToSketch()} />
        </div>
      </Segment>
    </div>
  )
}

export default PageMapPlanner
