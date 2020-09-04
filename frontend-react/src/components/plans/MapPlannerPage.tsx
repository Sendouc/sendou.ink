import { Box, Flex } from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import { SketchField, Tools } from "@sendou/react-sketch"
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet-async"
import {
  FaBomb,
  FaFileDownload,
  FaFileImage,
  FaFileUpload,
} from "react-icons/fa"
import { weapons } from "../../assets/imageImports"
import useBreakPoints from "../../hooks/useBreakPoints"
import { Stage, Weapon } from "../../types"
import weaponDict from "../../utils/english_internal.json"
import Error from "../common/Error"
import PageHeader from "../common/PageHeader"
import Button from "../elements/Button"
import DraggableToolsSelector from "./DraggableToolsSelector"
import DraggableWeaponSelector from "./DraggableWeaponSelector"
import MapSelect from "./MapSelect"
import { useTranslation } from "react-i18next"

export interface PlannerMapBg {
  view: "M" | "R"
  stage: Stage
  mode: "SZ" | "TC" | "RM" | "CB"
}

const REEF = {
  view: "M",
  stage: "The Reef",
  mode: "SZ",
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

const codes = [
  ["AG", "Ancho-V Games"],
  ["AM", "Arowana Mall"],
  ["BS", "Blackbelly Skatepark"],
  ["CT", "Camp Triggerfish"],
  ["GA", "Goby Arena"],
  ["HP", "Humpback Pump Track"],
  ["IA", "Inkblot Art Academy"],
  ["KD", "Kelp Dome"],
  ["MF", "Musselforge Fitness"],
  ["MK", "MakoMart"],
  ["MM", "Manta Maria"],
  ["MT", "Moray Towers"],
  ["NA", "New Albacore Hotel"],
  ["PM", "Port Mackerel"],
  ["PP", "Piranha Pit"],
  ["SC", "Snapper Canal"],
  ["SI", "Shellendorf Institute"],
  ["SM", "Starfish Mainstage"],
  ["SP", "Skipper Pavilion"],
  ["SS", "Sturgeon Shipyard"],
  ["TR", "The Reef"],
  ["WH", "Wahoo World"],
  ["WW", "Walleye Warehouse"],
] as const

const codeToStage = new Map(codes)

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
  const [bg, setBg] = useState<PlannerMapBg>(REEF)
  const [controlledValue, setControlledValue] = useState(defaultValue)
  const { t } = useTranslation()

  // doesn't work properly when coming back from another page - not sure why
  useLayoutEffect(() => {
    sketch.setBackgroundFromDataUrl(plannerMapBgToImage(REEF))
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
    if (!sketch) return
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
    if (!fileInput.current) {
      return
    }
    fileInput.current.click()
  }

  const parseAndSetForms = (name: string) => {
    const firstPart = name.split(" ")[0]
    if (!(firstPart.length === 7 || !firstPart.includes("-"))) return

    const split = firstPart.split("-")
    if (split.length !== 3) return

    const [view, stage, mode] = split

    if (!["M", "R"].includes(view)) return
    if (
      !Array.from(reversedCodes.values())
        .map((tuple) => tuple[1])
        .includes(stage as any)
    )
      if (!["SZ", "TC", "RM", "CB"].includes(mode)) return

    setBg({
      view: view as any,
      stage: codeToStage.get(stage as any)!,
      mode: mode as any,
    })
  }

  const files = fileInput.current?.files

  useEffect(() => {
    if (!fileInput.current?.files?.length) return

    const fileObj = fileInput.current.files[0]
    const reader = new FileReader()
    reader.onload = function (event) {
      const jsonObj = JSON.parse(event.target!.result as any)
      setControlledValue(jsonObj)
    }

    reader.readAsText(fileObj)

    parseAndSetForms(fileObj.name)
  }, [files])

  useEffect(() => {
    if (!sketch) return
    setCanUndo(false)
    sketch.setBackgroundFromDataUrl(plannerMapBgToImage(bg))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg])

  return (
    <>
      <Helmet>
        <title>{t("navigation;Map Planner")} | sendou.ink</title>
      </Helmet>
      <PageHeader title={t("navigation;Map Planner")} />
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
      {isSmall && <Error errorMessage={t("plans;tooNarrowAlert")} />}
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
          onClick={() => {
            sketch.clear()
            setBg({ ...bg })
          }}
          icon={FaBomb}
          outlined
          color="red"
        >
          {t("plans;Clear drawings")}
        </Button>
        <Box w="300px" />
        <Button
          onClick={() => download(sketch.toDataURL(), "png")}
          icon={FaFileImage}
          outlined
        >
          {t("plans;Download as .png")}
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
          {t("plans;Download as .json")}
        </Button>
        <Button onClick={() => handleUpload()} icon={FaFileUpload} outlined>
          {t("plans;Load from .json")}
        </Button>
      </Flex>
      <input
        type="file"
        accept=".json"
        ref={fileInput}
        style={{ display: "none" }}
        onChange={() => setBg({ ...bg })}
      />
      <Flex mt="2em" justify="center">
        <MapSelect bg={bg} setBg={setBg} />
      </Flex>
    </>
  )
}

export default MapPlannerPage
