import React, { useState } from "react"
import { Search } from "semantic-ui-react"
import { gearEnglish } from "../../utils/lists"
import english_internal from "../../utils/english_internal.json"

const GearSearch = ({ setGear, slot = "head" }) => {
  const [value, setValue] = useState("")
  const [results, setResults] = useState([])
  const handleSearchChange = (e, { value }) => {
    setValue(value)
    const filteredResults = gearEnglish.reduce((acc, cur) => {
      const results = cur[slot].filter(gear => {
        const valueUpper = value.toUpperCase()
        return (
          gear.toUpperCase().indexOf(valueUpper) !== -1 ||
          cur.brand.toUpperCase().indexOf(valueUpper) !== -1
        )
      })
      if (results.length)
        acc[cur.brand] = {
          name: cur.brand,
          results: results.map(gear => ({
            title: gear,
            image: `https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${english_internal[gear]}.png`,
          })),
        }
      return acc
    }, {})

    setResults(filteredResults)
  }
  return (
    <Search
      category
      fluid
      onResultSelect={(e, { result }) => {
        setValue(result.title)
        setGear(result.title)
      }}
      onSearchChange={handleSearchChange}
      results={results}
      value={value}
      minCharacters={2}
    />
  )
}

export default GearSearch
