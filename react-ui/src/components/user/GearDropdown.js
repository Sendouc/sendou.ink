import React from "react"
import { Dropdown } from "semantic-ui-react"
import { gearEnglish } from "../../utils/lists"

const GearDropdown = ({ value, onChange, slot = "head" }) => {
  return (
    <Dropdown
      className="selection"
      placeholder={`Choose ${slot}`}
      search
      closeOnEscape
      style={{ width: "270px" }}
      onChange={onChange}
      value={value}
    >
      <Dropdown.Menu>
        {gearEnglish.map(gears => {
          if (gears[slot].length === 0) return null
          return (
            <React.Fragment key={gears.brand}>
              <Dropdown.Header>{gears.brand}</Dropdown.Header>
              {gears[slot].map(gear => (
                <Dropdown.Item key={gear}>{gear}</Dropdown.Item>
              ))}
            </React.Fragment>
          )
        })}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default GearDropdown
