import React, { useState, useContext } from "react"
import Draggable from "react-draggable"
import { Tools } from "@sendou/react-sketch"
import { useHotkeys } from "react-hotkeys-hook"
import { Box, Flex, Tooltip, IconButton } from "@chakra-ui/core"
import {
  FaPencilAlt,
  FaSquareFull,
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
          <Tooltip
            hasArrow
            label="Pencil (P)"
            placement="top"
            aria-label="Pencil tooltip"
            zIndex={999}
            closeOnClick
          >
            <IconButton
              onClick={() => setTool(Tools.Pencil)}
              variant="ghost"
              size="lg"
              aria-label="Pencil tool"
              icon={FaPencilAlt}
            />
          </Tooltip>
          <Tooltip
            hasArrow
            label="Line (L)"
            placement="top"
            aria-label="Line tooltip"
            zIndex={999}
            closeOnClick
          >
            <IconButton
              onClick={() => setTool(Tools.Line)}
              variant="ghost"
              size="lg"
              aria-label="Line tool"
              icon={AiOutlineLine}
            />
          </Tooltip>
          <Tooltip
            hasArrow
            label="Rectangle (R)"
            placement="top"
            aria-label="Rectangle tooltip"
            zIndex={999}
            closeOnClick
          >
            <IconButton
              onClick={() => setTool(Tools.Rectangle)}
              variant="ghost"
              size="lg"
              aria-label="Rectangle tool"
              icon={FaRegSquare}
            />
          </Tooltip>
          <Tooltip
            hasArrow
            label="Circle (C)"
            placement="top"
            aria-label="Circle tooltip"
            zIndex={999}
            closeOnClick
          >
            <IconButton
              onClick={() => setTool(Tools.Circle)}
              variant="ghost"
              size="lg"
              aria-label="Circle tool"
              icon={FaRegCircle}
            />
          </Tooltip>
          <Tooltip
            hasArrow
            label="Select (S)"
            placement="top"
            aria-label="Select tooltip"
            zIndex={999}
            closeOnClick
          >
            <IconButton
              onClick={() => setTool(Tools.Select)}
              variant="ghost"
              size="lg"
              aria-label="Select tool"
              icon={FaRegObjectGroup}
            />
          </Tooltip>
          <Tooltip
            hasArrow
            label="Delete selected"
            placement="top"
            aria-label="Delete tooltip"
            zIndex={999}
            closeOnClick
          >
            <IconButton
              onClick={() => removeSelected()}
              isDisabled={removeIsDisabled}
              variant="ghost"
              size="lg"
              aria-label="Delete tool"
              icon={FaTrashAlt}
            />
          </Tooltip>
          <Tooltip
            hasArrow
            label="Undo"
            placement="top"
            aria-label="Undo tooltip"
            zIndex={999}
            closeOnClick
          >
            <IconButton
              onClick={() => undo()}
              isDisabled={undoIsDisabled}
              variant="ghost"
              size="lg"
              aria-label="Undo tool"
              icon={FaUndo}
            />
          </Tooltip>
          <Tooltip
            hasArrow
            label="Redo"
            placement="top"
            aria-label="Redo tooltip"
            zIndex={999}
            closeOnClick
          >
            <IconButton
              onClick={() => redo()}
              isDisabled={redoIsDisabled}
              variant="ghost"
              size="lg"
              aria-label="Redo tool"
              icon={FaRedo}
            />
          </Tooltip>
        </Flex>
      </Box>
    </Draggable>
  )
}

export default DraggableToolsSelector
