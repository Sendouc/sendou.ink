import React, { useState } from "react"
import Draggable from "react-draggable"
import { Icon } from "semantic-ui-react"
import { Tools } from "@sendou/react-sketch"

const ToolsSelector = ({ tool, setTool }) => {
  const [activeDrags, setActiveDrags] = useState(0)

  const onStart = () => {
    setActiveDrags(activeDrags + 1)
  }

  const onStop = () => {
    setActiveDrags(activeDrags - 1)
  }

  return (
    <Draggable handle="strong" onStart={onStart} onStop={onStop}>
      <div
        style={{
          position: "fixed",
          zIndex: "999",
          background: "white",
          borderRadius: "7px",
          boxShadow: "7px 14px 13px 2px rgba(0,0,0,0.24)",
          textAlign: "center",
          width: "119px",
        }}
      >
        <strong style={{ cursor: "move" }}>
          <div
            style={{
              fontSize: "17px",
              background: "#daedf4",
              borderRadius: "7px 7px 0 0",
              padding: "0.3em",
            }}
          >
            Tools
          </div>
        </strong>
        <div>
          <Icon
            name="pencil"
            color="blue"
            size="big"
            bordered
            inverted={tool === Tools.Pencil}
            onClick={() => setTool(Tools.Pencil)}
            style={{ cursor: "pointer", marginTop: "0.1em" }}
          />
          <Icon
            name="window minimize outline"
            color="blue"
            size="big"
            bordered
            inverted={tool === Tools.Line}
            onClick={() => setTool(Tools.Line)}
            style={{ cursor: "pointer", marginTop: "0.1em" }}
          />
          <Icon
            name="square outline"
            color="blue"
            size="big"
            bordered
            inverted={tool === Tools.Rectangle}
            onClick={() => setTool(Tools.Rectangle)}
            style={{ cursor: "pointer", marginTop: "0.1em" }}
          />
          <Icon
            name="circle outline"
            color="blue"
            size="big"
            bordered
            inverted={tool === Tools.Circle}
            onClick={() => setTool(Tools.Circle)}
            style={{ cursor: "pointer", marginTop: "0.1em" }}
          />
          <Icon
            name="object group outline"
            color="blue"
            size="big"
            bordered
            inverted={tool === Tools.Select}
            onClick={() => setTool(Tools.Select)}
            style={{ cursor: "pointer", marginTop: "0.1em" }}
          />
        </div>
      </div>
    </Draggable>
  )
}

export default ToolsSelector
