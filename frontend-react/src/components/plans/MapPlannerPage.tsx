import React, { useState, useEffect, useRef } from "react"
import { SketchField, Tools } from "@sendou/react-sketch"
import { CirclePicker } from "react-color"
import weaponDict from "../../utils/english_internal.json"
import { weapons } from "../../assets/imageImports"
import DraggableToolsSelector from "./DraggableToolsSelector"
import useBreakPoints from "../../hooks/useBreakPoints"
import { Helmet } from "react-helmet-async"
import { Weapon, Stage } from "../../types"
import Error from "../common/Error"
import {
  Flex,
  Box,
  InputGroup,
  Input,
  InputRightElement,
} from "@chakra-ui/core"
import { FaFileDownload, FaFileUpload, FaFileImage } from "react-icons/fa"
import MapSelect from "./MapSelect"
import { RouteComponentProps } from "@reach/router"
import PageHeader from "../common/PageHeader"
import DraggableWeaponSelector from "./DraggableWeaponSelector"
import Button from "../elements/Button"

export interface PlannerMapBg {
  view: "M" | "R"
  stage: Stage
  mode: "SZ" | "TC" | "RM" | "CB" | "TW"
}

const REEFTW = {
  view: "M",
  stage: "The Reef",
  mode: "TW",
} as const

const reversedCodes = [
  ["Ancho-V Games", "AG"],
  ["Arowana Mall", "AM"],
  ["Blackbelly Skatepark", "BS"],
  ["Camp Triggerfish", "CT"],
  ["Goby Arena", "GA"],
  ["Humpback Pump Track", "HP"],
  ["Inkblot Art Academy", "IA"],
  ["Kelp Dome", "KD"],
  ["Musselforge Fitness", "MF"],
  ["MakoMart", "MK"],
  ["Manta Maria", "MM"],
  ["Moray Towers", "MT"],
  ["New Albacore Hotel", "NA"],
  ["Port Mackerel", "PM"],
  ["Piranha Pit", "PP"],
  ["Snapper Canal", "SC"],
  ["Shellendorf Institute", "SI"],
  ["Starfish Mainstage", "SM"],
  ["Skipper Pavilion", "SP"],
  ["Sturgeon Shipyard", "SS"],
  ["The Reef", "TR"],
  ["Wahoo World", "WH"],
  ["Walleye Warehouse", "WW"],
] as const

const stageToCode = new Map<Stage, string>(reversedCodes)

const plannerMapBgToImage = (bg: PlannerMapBg) =>
  `${process.env.PUBLIC_URL}/plannerMaps/${bg.view} ${stageToCode.get(
    bg.stage
  )} ${bg.mode}.png`

const MapPlannerPage: React.FC<RouteComponentProps> = () => {
  let sketch: any = null
  const isSmall = useBreakPoints(1127)
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
  const fileInput = useRef<HTMLInputElement | null>(null)
  const [tool, setTool] = useState(Tools.RectangleLabel)
  const [color, setColor] = useState("#f44336")
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [bg, setBg] = useState<PlannerMapBg>(REEFTW)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [controlledValue, setControlledValue] = useState(defaultValue)

  // doesn't work properly when coming back from another page - not sure why
  useEffect(() => {
    if (!sketch) {
      return
    }
    setBg(REEFTW)
    sketch.setBackgroundFromDataUrl(plannerMapBgToImage(REEFTW))
  }, [sketch])

  const addImageToSketch = (weapon: Weapon) => {
    const wpnDict: any = weapons
    sketch.addImg(wpnDict[weaponDict[weapon]])
    setTool(Tools.Select)
  }

  const addTextToSketch = () => {
    sketch.addText("Double-click to edit", {
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

  const download = (dataUrl: string, extension: string) => {
    if (!bg) return
    let a = document.createElement("a")
    document.body.appendChild(a)
    a.style.display = "none"
    a.href = dataUrl
    a.download = `${bg.view}-${stageToCode.get(bg.stage)}-${
      bg.mode
    } plans ${getDateFormatted()}.${extension}`
    a.click()
    window.URL.revokeObjectURL(dataUrl)
  }

  const handleUpload = () => {
    if (!fileInput || !fileInput.current || !fileInput.current.files) return
    if (fileInput.current.files.length === 0) {
      setUploadError("Upload file")
      setTimeout(() => setUploadError(null), 5000)
      return
    }
    const fileObj = fileInput.current.files[0]
    const reader = new FileReader()
    reader.onload = function (event) {
      const jsonObj = JSON.parse(event.target!.result as any)
      setControlledValue(jsonObj)
    }

    reader.readAsText(fileObj)
  }

  useEffect(() => {
    if (!sketch) return
    sketch.clear()
    setCanUndo(false)
    sketch.setBackgroundFromDataUrl(plannerMapBgToImage(bg))
  }, [bg])

  return (
    <>
      <Helmet>
        <title>Map Planner | sendou.ink</title>
      </Helmet>
      <PageHeader title="Map Planner" />
      <DraggableToolsSelector
        tool={tool}
        setTool={setTool}
        redo={redo}
        redoIsDisabled={!canRedo}
        undo={undo}
        undoIsDisabled={!canUndo}
        removeSelected={removeSelected}
        removeIsDisabled={tool !== Tools.Select}
        addText={addTextToSketch}
        color={color}
        setColor={(newColor) => setColor(newColor)}
      />
      <Box ml="950px">
        <DraggableWeaponSelector
          addWeaponImage={(weapon) => addImageToSketch(weapon)}
        />
      </Box>
      {isSmall && (
        <Error
          errorMessage="Unfortunately this tool isn't designed for narrow screens but you can
        still give it a go."
        />
      )}
      <SketchField
        name="sketch"
        className="canvas-area"
        ref={(c: any) => (sketch = c)}
        lineColor={color}
        lineWidth={5}
        width={1127}
        height={634}
        value={controlledValue}
        onChange={onSketchChange}
        tool={tool}
        style={{ position: "relative", left: "-27px" }}
      />
      <Flex justifyContent="space-between" mt="1em" flexWrap="wrap">
        <Button
          onClick={() => download(sketch.toDataURL(), "png")}
          icon={FaFileImage}
          outlined
        >
          Download as .png
        </Button>
        <Button
          onClick={() =>
            download(
              "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(sketch.toJSON())),
              "json"
            )
          }
          icon={FaFileDownload}
          outlined
        >
          Download as .json
        </Button>
        <Button onClick={() => handleUpload()} icon={FaFileUpload} outlined>
          Load from .json
        </Button>
        <input type="file" accept=".json" ref={fileInput} />
      </Flex>
      {uploadError && <span style={{ color: "red" }}>{uploadError}</span>}
      <MapSelect bg={bg} setBg={setBg} />
    </>
  )
}

export default MapPlannerPage
