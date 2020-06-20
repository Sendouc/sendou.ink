import React, { useState, useContext } from "react"
import Draggable from "react-draggable"
import { Tools } from "@sendou/react-sketch"
import { useHotkeys } from "react-hotkeys-hook"
import {
  Box,
  Flex,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/core"
import {
  FaPencilAlt,
  FaRegSquare,
  FaRegCircle,
  FaRegObjectGroup,
  FaTrashAlt,
  FaRedo,
  FaUndo,
  FaFont,
} from "react-icons/fa"
import { AiOutlineLine } from "react-icons/ai"
import MyThemeContext from "../../themeContext"
import { CirclePicker, ColorResult } from "react-color"

interface PlannerColorPickerProps {
  color: string
  setColor: (newColor: string) => void
}

const PlannerColorPicker: React.FC<PlannerColorPickerProps> = ({
  color,
  setColor,
}) => {
  const { darkerBgColor } = useContext(MyThemeContext)
  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Box
          cursor="pointer"
          height="27px"
          width="27px"
          backgroundColor={color}
          borderRadius="50%"
          display="inline-block"
          mr="11px"
          ml="10px"
        />
      </PopoverTrigger>
      <PopoverContent zIndex={4} width="260px" backgroundColor={darkerBgColor}>
        <PopoverBody textAlign="center">
          <CirclePicker
            width="260px"
            onChangeComplete={(color: ColorResult) => setColor(color.hex)}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

interface DraggableToolsSelectorProps {
  tool: any
  setTool: React.Dispatch<any>
  redo: () => void
  redoIsDisabled: boolean
  undo: () => void
  undoIsDisabled: boolean
  removeSelected: () => void
  removeIsDisabled: boolean
  addText: () => void
  color: string
  setColor: (newColor: string) => void
}

const DraggableToolsSelector: React.FC<DraggableToolsSelectorProps> = ({
  tool,
  setTool,
  redo,
  redoIsDisabled,
  undo,
  undoIsDisabled,
  removeSelected,
  removeIsDisabled,
  addText,
  color,
  setColor,
}) => {
  const { darkerBgColor, themeColorHex } = useContext(MyThemeContext)
  const [activeDrags, setActiveDrags] = useState(0)
  useHotkeys("p", () => setTool(Tools.Pencil))
  useHotkeys("l", () => setTool(Tools.Line))
  useHotkeys("r", () => setTool(Tools.Rectangle))
  useHotkeys("c", () => setTool(Tools.Circle))
  useHotkeys("s", () => setTool(Tools.Select))

  const onStart = () => {
    setActiveDrags(activeDrags + 1)
  }

  const onStop = () => {
    setActiveDrags(activeDrags - 1)
  }

  return (
    <Draggable handle="strong" onStart={onStart} onStop={onStop}>
      <Box
        position="fixed"
        zIndex={900}
        background={darkerBgColor}
        borderRadius="7px"
        boxShadow="7px 14px 13px 2px rgba(0,0,0,0.24)"
        width="100px"
      >
        <strong style={{ cursor: "move" }}>
          <Box
            fontSize="17px"
            borderRadius="7px 7px 0 0"
            padding="0.3em"
            textAlign="center"
          >
            Tools
          </Box>
        </strong>
        <Flex flexWrap="wrap" justifyContent="center">
          <IconButton
            onClick={() => setTool(Tools.Pencil)}
            variant="ghost"
            size="lg"
            aria-label="Pencil tool"
            icon={FaPencilAlt}
            border={tool === Tools.Pencil ? "2px solid" : undefined}
            borderColor={themeColorHex}
            title="Pencil (P)"
          />
          <IconButton
            onClick={() => setTool(Tools.Line)}
            variant="ghost"
            size="lg"
            aria-label="Line tool"
            icon={AiOutlineLine}
            border={tool === Tools.Line ? "2px solid" : undefined}
            borderColor={themeColorHex}
            title="Line (L)"
          />
          <IconButton
            onClick={() => setTool(Tools.Rectangle)}
            variant="ghost"
            size="lg"
            aria-label="Rectangle tool"
            icon={FaRegSquare}
            border={tool === Tools.Rectangle ? "2px solid" : undefined}
            borderColor={themeColorHex}
            title="Rectangle (R)"
          />
          <IconButton
            onClick={() => setTool(Tools.Circle)}
            variant="ghost"
            size="lg"
            aria-label="Circle tool"
            icon={FaRegCircle}
            border={tool === Tools.Circle ? "2px solid" : undefined}
            borderColor={themeColorHex}
            title="Circle (C)"
          />
          <IconButton
            onClick={() => setTool(Tools.Select)}
            variant="ghost"
            size="lg"
            aria-label="Select tool"
            icon={FaRegObjectGroup}
            border={tool === Tools.Select ? "2px solid" : undefined}
            borderColor={themeColorHex}
            title="Select (S)"
          />
          <IconButton
            onClick={() => removeSelected()}
            isDisabled={removeIsDisabled}
            variant="ghost"
            size="lg"
            aria-label="Delete tool"
            icon={FaTrashAlt}
            title="Delete selected"
          />
          <IconButton
            onClick={() => undo()}
            isDisabled={undoIsDisabled}
            variant="ghost"
            size="lg"
            aria-label="Undo tool"
            icon={FaUndo}
            title="Undo"
          />
          <IconButton
            onClick={() => redo()}
            isDisabled={redoIsDisabled}
            variant="ghost"
            size="lg"
            aria-label="Redo tool"
            icon={FaRedo}
            title="Redo"
          />
          <IconButton
            onClick={() => addText()}
            variant="ghost"
            size="lg"
            aria-label="Add text"
            icon={FaFont}
            title="Add text"
          />
          <Flex justify="center" align="center">
            <PlannerColorPicker color={color} setColor={setColor} />
          </Flex>
        </Flex>
      </Box>
    </Draggable>
  )
}

export default DraggableToolsSelector
