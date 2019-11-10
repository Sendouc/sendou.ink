import React from "react"
import { Dropdown } from "semantic-ui-react"

import { weapons } from "../../utils/lists"
import { wpnSmall } from "../../assets/imageImports"
import weaponDict from "../../utils/english_internal.json"

const WeaponDropdown = ({
  value,
  onChange,
  multiple = false,
  showImages = true,
  nonMultiplePlaceholder = "Choose a weapon"
}) => {
  return (
    <Dropdown
      placeholder={multiple ? "Choose a comp" : nonMultiplePlaceholder}
      search
      selection
      closeOnEscape
      multiple={multiple}
      onChange={onChange}
      value={value}
      style={{ width: "270px" }}
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
    />
  )
}

export default WeaponDropdown
