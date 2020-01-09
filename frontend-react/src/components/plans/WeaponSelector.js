import React, { useState } from "react"
import Draggable from "react-draggable"
import { weapons } from "../../utils/lists"
import WpnImage from "../common/WpnImage"

const WeaponSelector = ({ addWeaponImage }) => {
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
              background: "#ffcccb",
              borderRadius: "7px 7px 0 0",
              padding: "0.3em",
            }}
          >
            Weapons
          </div>
        </strong>
        <div style={{ overflowY: "scroll", height: "50vh" }}>
          {weapons.map(wpn => (
            <WpnImage
              key={wpn}
              size="small"
              weapon={wpn}
              style={{ display: "inline", cursor: "pointer", margin: "0.1em" }}
              onClick={() => addWeaponImage(wpn)}
            />
          ))}
        </div>
      </div>
    </Draggable>
  )
}

export default WeaponSelector
