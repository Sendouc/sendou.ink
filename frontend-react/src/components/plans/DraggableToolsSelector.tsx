import React, { useState, useContext } from "react"
import Draggable from "react-draggable"
import { Tools } from "@sendou/react-sketch"
import { useHotkeys } from "react-hotkeys-hook"
import { Box, Flex, Tooltip, IconButton } from "@chakra-ui/core"
import {
  FaPencilAlt,
  FaRegSquare,
  FaRegCircle,
  FaRegObjectGroup,
  FaTrashAlt,
  FaRedo,
  FaUndo,
} from "react-icons/fa"
import { AiOutlineLine } from "react-icons/ai"
import MyThemeContext from "../../themeContext"

interface DraggableToolsSelectorProps {
  tool: any
  setTool: React.Dispatch<any>
  redo: () => void
  redoIsDisabled: boolean
  undo: () => void
  undoIsDisabled: boolean
  removeSelected: () => void
  removeIsDisabled: boolean
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
}) => {
  const { darkerBgColor } = useContext(MyThemeContext)
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
            title="Pencil (P)"
          />
          <IconButton
            onClick={() => setTool(Tools.Line)}
            variant="ghost"
            size="lg"
            aria-label="Line tool"
            icon={AiOutlineLine}
            title="Line (L)"
          />
          <IconButton
            onClick={() => setTool(Tools.Rectangle)}
            variant="ghost"
            size="lg"
            aria-label="Rectangle tool"
            icon={FaRegSquare}
            title="Rectangle (R)"
          />
          <IconButton
            onClick={() => setTool(Tools.Circle)}
            variant="ghost"
            size="lg"
            aria-label="Circle tool"
            icon={FaRegCircle}
            title="Circle (C)"
          />
          <IconButton
            onClick={() => setTool(Tools.Select)}
            variant="ghost"
            size="lg"
            aria-label="Select tool"
            icon={FaRegObjectGroup}
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
        </Flex>
      </Box>
    </Draggable>
  )
}

export default DraggableToolsSelector
