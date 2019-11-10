import React from "react"
import { Dropdown } from "semantic-ui-react"

const YearDropdown = ({ value, onChange, startYear = 2018 }) => {
  const options = []
  for (let index = startYear; index <= new Date().getFullYear(); index++) {
    options.push({ key: index, text: index, value: index })
  }
  return (
    <Dropdown
      clearable
      value={value}
      onChange={onChange}
      selection
      style={{ width: "270px" }}
      options={options}
    />
  )
}

export default YearDropdown
