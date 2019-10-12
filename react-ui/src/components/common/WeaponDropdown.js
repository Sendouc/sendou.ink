import React from "react"
import { Dropdown } from "semantic-ui-react"

import { weapons } from "../../utils/lists"
import { wpnSmall } from "../../assets/imageImports"
import weaponDict from "../../utils/english_internal.json"

const WeaponDropdown = ({ value, onChange, showImages = true }) => {
  return (
    <Dropdown
      placeholder="Choose a weapon"
      search
      selection
      closeOnEscape
      onChange={onChange}
      value={value}
      style={{ width: "250px" }}
      options={weapons.map(w => ({
        key: w,
        text: w,
        value: w,
        image: showImages
          ? {
              src: wpnSmall[weaponDict[w]]
            }
          : null
      }))}
    >
      {}
    </Dropdown>
  )
}

export default WeaponDropdown
