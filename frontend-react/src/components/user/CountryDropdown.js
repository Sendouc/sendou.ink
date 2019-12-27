import React from "react"
import { Dropdown } from "semantic-ui-react"
import { countries } from "../../utils/lists"

const CountryDropdown = ({ value, onChange }) => {
  return (
    <Dropdown
      style={{ maxWidth: "270px" }}
      value={value}
      onChange={onChange}
      placeholder="Select Country"
      fluid
      search
      selection
      clearable
      options={countries.map(country => ({
        key: country.code,
        value: country.code,
        flag: country.code,
        text: country.name,
      }))}
    />
  )
}

export default CountryDropdown
