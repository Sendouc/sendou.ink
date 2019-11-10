import React from "react"
import { Dropdown } from "semantic-ui-react"

const options = [
  {
    key: "January",
    text: "January",
    value: 1
  },
  {
    key: "February",
    text: "February",
    value: 2
  },
  {
    key: "March",
    text: "March",
    value: 3
  },
  {
    key: "April",
    text: "April",
    value: 4
  },
  {
    key: "May",
    text: "May",
    value: 5
  },
  {
    key: "June",
    text: "June",
    value: 6
  },
  {
    key: "July",
    text: "July",
    value: 7
  },
  {
    key: "August",
    text: "August",
    value: 8
  },
  {
    key: "September",
    text: "September",
    value: 9
  },
  {
    key: "October",
    text: "October",
    value: 10
  },
  {
    key: "November",
    text: "November",
    value: 11
  },
  {
    key: "December",
    text: "December",
    value: 12
  }
]

const MonthDropdown = ({ value, onChange }) => {
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

export default MonthDropdown
