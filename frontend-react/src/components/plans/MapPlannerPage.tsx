import React, { useState, useEffect, useRef, useContext } from "react"
import { SketchField, Tools } from "@sendou/react-sketch"
import { CirclePicker } from "react-color"
import weaponDict from "../../utils/english_internal.json"
import { wpnMedium } from "../../assets/imageImports"
import DraggableToolsSelector from "./DraggableToolsSelector"
import useBreakPoints from "../../hooks/useBreakPoints"
import { Helmet } from "react-helmet-async"
import { Weapon } from "../../types"
import Error from "../common/Error"
import {
  IconButton,
  Button,
  Flex,
  Box,
  InputGroup,
  Input,
  InputRightElement,
} from "@chakra-ui/core"
import { MdUndo, MdRedo } from "react-icons/md"
import MyThemeContext from "../../themeContext"
import {
  FaTrashAlt,
  FaUndo,
  FaRedo,
  FaCloudDownloadAlt,
  FaFileDownload,
  FaFileUpload,
  FaFileImage,
} from "react-icons/fa"
import reef from "../../assets/plannerMaps/reef-sz.png"
import MapSelect from "./MapSelect"
import { RouteComponentProps } from "@reach/router"
import PageHeader from "../common/PageHeader"
import DraggableWeaponSelector from "./DraggableWeaponSelector"

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
  const { themeColor } = useContext(MyThemeContext)
  const [tool, setTool] = useState(Tools.Pencil)
  const [color, setColor] = useState("#f44336")
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [text, setText] = useState("")
  const [bg, setBg] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [controlledValue, setControlledValue] = useState(defaultValue)

  // doesn't work properly when coming back from another page - not sure why
  useEffect(() => {
    if (!sketch) {
      return
    }
    setBg(reef)
    sketch.setBackgroundFromDataUrl(reef)
  }, [sketch])

  const addImageToSketch = (weapon: Weapon) => {
    const wpnDict: any = wpnMedium
    sketch.addImg(wpnDict[weaponDict[weapon]])
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

  const download = (dataUrl: string, extension: string) => {
    if (!bg) return
    let a = document.createElement("a")
    document.body.appendChild(a)
    a.style.display = "none"
    a.href = dataUrl
    a.download = `${
      bg.replace("/static/media/", "").split("-")[0]
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
    reader.onload = function(event) {
      const jsonObj = JSON.parse(event.target!.result as any)
      setControlledValue(jsonObj)
    }

    reader.readAsText(fileObj)
  }

  const onBgChange = (value: string) => {
    sketch.clear()
    setBg(value)
    setCanUndo(false)
    sketch.setBackgroundFromDataUrl(value)
  }

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
      />
      <Box ml="950px">
        <DraggableWeaponSelector
          addWeaponImage={weapon => addImageToSketch(weapon)}
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
          leftIcon={FaFileImage}
          variantColor={themeColor}
          variant="outline"
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
          leftIcon={FaFileDownload}
          variantColor={themeColor}
          variant="outline"
        >
          Download as .json
        </Button>
        <Button
          onClick={() => handleUpload()}
          leftIcon={FaFileUpload}
          variantColor={themeColor}
          variant="outline"
        >
          Load from .json
        </Button>
        <input type="file" accept=".json" ref={fileInput} />
      </Flex>
      {uploadError && <span style={{ color: "red" }}>{uploadError}</span>}
      <Flex justifyContent="space-between" mt="1em" flexWrap="wrap">
        <InputGroup size="md">
          <Input
            pr="7rem"
            width="430px"
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setText(e.currentTarget.value)
            }
          />
          <InputRightElement width="7rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={() => addTextToSketch()}
              isDisabled={text === ""}
            >
              Add to picture
            </Button>
          </InputRightElement>
        </InputGroup>
        <Box>
          <MapSelect map={bg} setMap={onBgChange} />
        </Box>
        {/*<Label basic color="red" pointing="above">
                Please note that changing the map also clears all the drawings
        </Label>*/}
        <CirclePicker
          color={color}
          width="220px"
          onChangeComplete={newColor => setColor(newColor.hex)}
          colors={[
            "#f44336",
            "#e91e63",
            "#9c27b0",
            "#673ab7",
            "#3f51b5",
            "#2196f3",
            "#03a9f4",
            "#00bcd4",
            "#009688",
            "#4caf50",
            "#8bc34a",
            "#cddc39",
            "#ffeb3b",
            "#ffc107",
            "#ff9800",
          ]}
        />
        <Box />
      </Flex>
    </>
  )
}

export default MapPlannerPage
