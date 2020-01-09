import React, { useState, useEffect, useRef } from "react"
import { SketchField, Tools } from "@sendou/react-sketch"
import { CirclePicker } from "react-color"
import {
  Button,
  Icon,
  Input,
  Grid,
  Label,
  Message,
  Dropdown,
} from "semantic-ui-react"
import WeaponDropdown from "../common/WeaponDropdown"
import weaponDict from "../../utils/english_internal.json"
import useWindowDimensions from "../../hooks/useWindowDimensions"

import academy from "../../assets/plannerMaps/academy-sz.png"
import arena from "../../assets/plannerMaps/arena-sz.png"
import camp from "../../assets/plannerMaps/camp-sz.png"
import canal from "../../assets/plannerMaps/canal-sz.png"
import dome from "../../assets/plannerMaps/dome-sz.png"
import fitness from "../../assets/plannerMaps/fitness-sz.png"
import games from "../../assets/plannerMaps/games-sz.png"
import hotel from "../../assets/plannerMaps/hotel-sz.png"
import institute from "../../assets/plannerMaps/institute-sz.png"
import mainstage from "../../assets/plannerMaps/mainstage-sz.png"
import mall from "../../assets/plannerMaps/mall-sz.png"
import manta from "../../assets/plannerMaps/manta-sz.png"
import mart from "../../assets/plannerMaps/mart-sz.png"
import pavilion from "../../assets/plannerMaps/pavilion-sz.png"
import pit from "../../assets/plannerMaps/pit-sz.png"
import pitrm from "../../assets/plannerMaps/pit-rm.png"
import port from "../../assets/plannerMaps/port-sz.png"
import pumptrack from "../../assets/plannerMaps/pumptrack-sz.png"
import reef from "../../assets/plannerMaps/reef-sz.png"
import shipyard from "../../assets/plannerMaps/shipyard-sz.png"
import skatepark from "../../assets/plannerMaps/skatepark-sz.png"
import towers from "../../assets/plannerMaps/towers-sz.png"
import warehouse from "../../assets/plannerMaps/warehouse-sz.png"
import world from "../../assets/plannerMaps/world-sz.png"
import { wpnMedium } from "../../assets/imageImports"
import ToolsSelector from "./ToolsSelector"

const MapPlanner = () => {
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
    enableCopyPaste: false,
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

  useEffect(() => {
    document.title = "Planner - sendou.ink"
  }, [])

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
      text: "Pencil",
      value: Tools.Pencil,
      icon: "pencil",
    },
    {
      key: 2,
      text: "Line",
      value: Tools.Line,
      icon: "window minimize outline",
    },
    {
      key: 3,
      text: "Rectangle",
      value: Tools.Rectangle,
      icon: "square outline",
    },
    {
      key: 4,
      text: "Circle",
      value: Tools.Circle,
      icon: "circle outline",
    },
    {
      key: 5,
      text: "Select",
      value: Tools.Select,
      icon: "object group outline",
    },
  ]

  const maps = [
    { key: "The Reef", text: "The Reef", value: reef },
    {
      key: "Musselforge Fitness",
      text: "Musselforge Fitness",
      value: fitness,
    },
    {
      key: "Starfish Mainstage",
      text: "Starfish Mainstage",
      value: mainstage,
    },
    {
      key: "Humpback Pump Track",
      text: "Humpback Pump Track",
      value: pumptrack,
    },
    {
      key: "Inkblot Art Academy",
      text: "Inkblot Art Academy",
      value: academy,
    },
    {
      key: "Sturgeon Shipyard",
      text: "Sturgeon Shipyard",
      value: shipyard,
    },
    { key: "Moray Towers", text: "Moray Towers", value: towers },
    { key: "Port Mackerel", text: "Port Mackerel", value: port },
    { key: "Manta Maria", text: "Manta Maria", value: manta },
    { key: "Kelp Dome", text: "Kelp Dome", value: dome },
    { key: "Snapper Canal", text: "Snapper Canal", value: canal },
    {
      key: "Blackbelly Skatepark",
      text: "Blackbelly Skatepark",
      value: skatepark,
    },
    { key: "MakoMart", text: "MakoMart", value: mart },
    {
      key: "Walleye Warehouse",
      text: "Walleye Warehouse",
      value: warehouse,
    },
    {
      key: "Shellendorf Institute",
      text: "Shellendorf Institute",
      value: institute,
    },
    { key: "Arowana Mall", text: "Arowana Mall", value: mall },
    { key: "Goby Arena", text: "Goby Arena", value: arena },
    { key: "Piranha Pit", text: "Piranha Pit", value: pit },
    {
      key: "Piranha Pit (RM)",
      text: "Piranha Pit (RM)",
      value: pitrm,
    },
    {
      key: "Camp Triggerfish",
      text: "Camp Triggerfish",
      value: camp,
    },
    { key: "Wahoo World", text: "Wahoo World", value: world },
    {
      key: "New Albacore Hotel",
      text: "New Albacore Hotel",
      value: hotel,
    },
    { key: "Ancho-V Games", text: "Ancho-V Games", value: games },
    {
      key: "Skipper Pavilion",
      text: "Skipper Pavilion",
      value: pavilion,
    },
  ]

  const addImageToSketch = () => {
    sketch.addImg(wpnMedium[weaponDict[weapon]])
    setTool(Tools.Select)
  }

  const addTextToSketch = () => {
    sketch.addText(text, {
      fill: color,
      fontFamily: "lato",
      stroke: "#000000",
      strokeWidth: 3,
      paintFirst: "stroke",
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
    <>
      <ToolsSelector tool={tool} setTool={setTool} />
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
        value={controlledValue}
        onChange={onSketchChange}
        tool={tool}
        style={{ position: "relative", left: "-27px" }}
      />
      <div style={{ marginTop: "1em" }}>
        <Button primary icon disabled={!canUndo} onClick={() => undo()}>
          <Icon name="undo" /> Undo
        </Button>
        <Button primary icon disabled={!canRedo} onClick={() => redo()}>
          <Icon name="redo" /> Redo
        </Button>
        <Button
          primary
          icon
          disabled={tool !== Tools.Select}
          onClick={() => removeSelected()}
        >
          <Icon name="trash" /> Delete selected
        </Button>
        <Button
          secondary
          icon
          onClick={() => download(sketch.toDataURL(), "png")}
        >
          <Icon name="download" /> Download as .png
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
          <Icon name="cloud download" /> Download as .json
        </Button>
        <Button secondary icon onClick={() => handleUpload()}>
          <Icon name="cloud upload" /> Load from .json
        </Button>
        <input type="file" accept=".json" ref={fileInput} />
        {uploadError && <span style={{ color: "red" }}>{uploadError}</span>}
        <div style={{ paddingTop: "10px" }}>
          <Grid columns={2}>
            <Grid.Column>
              <CirclePicker
                color={color}
                onChangeComplete={newColor => setColor(newColor.hex)}
              />
            </Grid.Column>
            <Grid.Column>
              <h3>Add text</h3>
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
        <Grid columns={3}>
          <Grid.Column>
            <h3>Choose the map</h3>
            <Dropdown
              onChange={(e, { value }) => onBgChange(value)}
              options={maps}
              selection
              value={bg}
              style={{ width: "250px" }}
            />
            <Label basic color="red" pointing="above">
              Please note that changing the map also clears all the drawings
            </Label>
          </Grid.Column>
          <Grid.Column>
            <h3>Choose a weapon to add</h3>
            <WeaponDropdown
              value={weapon}
              onChange={(e, { value }) => setWeapon(value)}
            />
            <div style={{ paddingTop: "7px" }}>
              <Button icon="plus" circular onClick={() => addImageToSketch()} />
            </div>
          </Grid.Column>
          <Grid.Column></Grid.Column>
        </Grid>
      </div>
    </>
  )
}
export default MapPlanner
