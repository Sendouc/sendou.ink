import { Box, Button, ButtonGroup, Divider, Flex } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import DraggableToolsSelector from "components/plans/DraggableToolsSelector";
import ImageAdder from "components/plans/ImageAdder";
import StageSelector from "components/plans/StageSelector";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  FaBomb,
  FaFileDownload,
  FaFileImage,
  FaFileUpload,
} from "react-icons/fa";
import { stages } from "utils/lists/stages";
import MyHead from "../components/common/MyHead";

const MapSketch = dynamic(() => import("components/plans/MapSketch"), {
  ssr: false,
});

export type Tool = "pencil" | "line" | "rectangle" | "circle" | "select";

export interface PlannerMapBg {
  view?: "M" | "R";
  stage: string;
  mode?: "SZ" | "TC" | "RM" | "CB";
  tide?: "low" | "mid" | "high";
}

const stageToCode = new Map<string, string>([
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
]);

const plannerMapBgToImage = (bg: PlannerMapBg) => {
  if (!bg.tide)
    return `images/plannerMaps/${bg.view} ${stageToCode.get(bg.stage)} ${
      bg.mode
    }.png`;

  return `images/plannerMaps/${bg.stage}-${bg.tide}.png`;
};

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
  backgroundImage: {
    type: "image",
    version: "2.4.3",
    originX: "left",
    originY: "top",
    left: 0,
    top: 0,
    width: 1127,
    height: 634,
    fill: "rgb(0,0,0)",
    stroke: null,
    strokeWidth: 0,
    strokeDashArray: null,
    strokeLineCap: "butt",
    strokeLineJoin: "miter",
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    clipTo: null,
    backgroundColor: "",
    fillRule: "nonzero",
    paintFirst: "fill",
    globalCompositeOperation: "source-over",
    transformMatrix: null,
    skewX: 0,
    skewY: 0,
    crossOrigin: "",
    cropX: 0,
    cropY: 0,
    src: "/images/plannerMaps/M%20TR%20SZ.png",
    filters: [],
  },
};

const MapPlannerPage = () => {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const sketch = useRef<any>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#f44336");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [bg, setBg] = useState<PlannerMapBg>({
    view: "M",
    stage: "The Reef",
    mode: "SZ",
  });
  const [controlledValue, setControlledValue] = useState(defaultValue);

  const addImageToSketch = (imgSrc: string) => {
    sketch.current.addImg(imgSrc);
    setTool("select");
  };

  const addTextToSketch = () => {
    sketch.current.addText("Double-click to edit", {
      fill: color,
      fontFamily: "lato",
      stroke: "#000000",
      strokeWidth: 3,
      paintFirst: "stroke",
    });
    setTool("select");
  };

  const undo = () => {
    sketch.current.undo();
    setCanUndo(sketch.current.canUndo());
    setCanRedo(sketch.current.canRedo());
  };

  const redo = () => {
    sketch.current.redo();
    setCanUndo(sketch.current.canUndo());
    setCanRedo(sketch.current.canRedo());
  };

  const removeSelected = () => {
    sketch.current.removeSelected();
  };

  const onSketchChange = () => {
    if (!sketch.current) return;
    let prev = canUndo;
    let now = sketch.current.canUndo();
    if (prev !== now) {
      setCanUndo(now);
    }
  };

  const getDateFormatted = () => {
    const today = new Date();
    const date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    const time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + " " + time;
  };

  const download = (dataUrl: string, extension: string) => {
    if (!bg) return;
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = dataUrl;
    a.download = `${bg.stage} plans ${getDateFormatted()}.${extension}`;
    a.click();
    window.URL.revokeObjectURL(dataUrl);
  };

  const handleUpload = () => {
    if (!fileInput.current) {
      return;
    }
    fileInput.current.click();
  };

  const files = fileInput.current?.files;

  useEffect(() => {
    if (!fileInput.current?.files?.length) return;

    const fileObj = fileInput.current.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const jsonObj = JSON.parse(event.target!.result as any);
      setControlledValue(jsonObj);

      const imgSrc = jsonObj.backgroundImage.src;
      const searchFolder = "plannerMaps";
      const imgName = imgSrc
        .slice(imgSrc.lastIndexOf(searchFolder) + searchFolder.length + 1, -4)
        .replace(/%20/g, " ");

      const salmonRunMaps = [
        "Spawning Grounds",
        "Marooner's Bay",
        "Lost Outpost",
        "Salmonid Smokeyard",
        "Ruins of Ark Polaris‎‎",
      ];
      let isSalmonRunMap = false;
      for (const map of salmonRunMaps) {
        if (imgName.startsWith(map)) {
          isSalmonRunMap = true;
          const imageNameParts = imgName.split("-");
          if (imageNameParts.length > 1) {
            const tide = imageNameParts[1];
            setBg({ tide: tide, stage: map });
          }
        }
      }

      if (!isSalmonRunMap) {
        const imageNameParts = imgName.split(" ");
        if (imageNameParts.length > 2) {
          const view = imageNameParts[0];
          const mapCode = imageNameParts[1];
          const mode = imageNameParts[2];
          let mapName = "";
          stageToCode.forEach((value, key) => {
            if (value === mapCode) {
              mapName = key;
            }
          });
          setBg({ view, stage: mapName, mode });
        }
      }
    };
    reader.readAsText(fileObj);
  }, [files]);

  useEffect(() => {
    if (!sketch.current) return;
    setCanUndo(false);
    sketch.current.setBackgroundFromDataUrl(plannerMapBgToImage(bg));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg]);

  return (
    <>
      <MyHead title={t`Map Planner`} />
      <Box w="72rem">
        <DraggableToolsSelector
          tool={tool}
          setTool={setTool}
          redo={redo}
          redoIsDisabled={!canRedo}
          undo={undo}
          undoIsDisabled={!canUndo}
          removeSelected={removeSelected}
          addText={addTextToSketch}
          color={color}
          setColor={setColor}
        />
        <MapSketch
          sketch={sketch}
          controlledValue={controlledValue}
          color={color}
          onSketchChange={onSketchChange}
          tool={tool}
        />

        <ImageAdder addImageToSketch={addImageToSketch} />
        <Divider mx="3" my={4} />
        <Flex mt={6} mb={2} justifyContent="space-between">
          <Button
            onClick={() => {
              sketch.current.clear();
              setBg({ ...bg });
            }}
            leftIcon={<FaBomb />}
            colorScheme="red"
            size="sm"
            variant="outline"
          >
            <Trans>Clear drawings</Trans>
          </Button>
          <ButtonGroup variant="outline" size="sm" isAttached>
            <Button
              onClick={() => download(sketch.current.toDataURL(), "png")}
              leftIcon={<FaFileImage />}
            >
              <Trans>Download as .png</Trans>
            </Button>
            <Button
              onClick={() =>
                download(
                  "data:text/json;charset=utf-8," +
                    encodeURIComponent(JSON.stringify(sketch.current.toJSON())),
                  "json"
                )
              }
              leftIcon={<FaFileDownload />}
            >
              <Trans>Download as .json</Trans>
            </Button>
            <Button onClick={() => handleUpload()} leftIcon={<FaFileUpload />}>
              <Trans>Load from .json</Trans>
            </Button>
          </ButtonGroup>
        </Flex>
        <StageSelector
          handleChange={(e) => {
            const newStage = e.target.value;
            if (newStage === "") {
              return;
            }
            const newIsSalmonRunStage = !stages.includes(newStage as any);
            const oldIsSalmonRunStage = !stages.includes(bg.stage as any);

            if (newIsSalmonRunStage === oldIsSalmonRunStage) {
              setBg({ ...bg, stage: e.target.value });
              return;
            }

            if (newIsSalmonRunStage) {
              setBg({ stage: e.target.value, tide: "mid" });
              return;
            }

            setBg({ stage: e.target.value, mode: "SZ", view: "M" });
          }}
          currentBackground={bg}
          changeMode={(mode) => setBg({ ...bg, mode })}
          changeTide={(tide: "low" | "mid" | "high") => setBg({ ...bg, tide })}
          changeView={(view: "M" | "R") => setBg({ ...bg, view })}
        />
        <input
          type="file"
          accept=".json"
          ref={fileInput}
          style={{ display: "none" }}
          onChange={() => setBg({ ...bg })}
        />
      </Box>
    </>
  );
};

export default MapPlannerPage;
