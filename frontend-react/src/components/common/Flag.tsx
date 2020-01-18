import React from "react"
import { CountryCode } from "../../types"

interface FlagProps {
  code: CountryCode
}

const Flag: React.FC<FlagProps> = ({ code }) => {
  return (
    <img
      src={`https://www.countryflags.io/${code}/flat/16.png`}
      style={{ display: "inline", marginRight: "8px" }}
      alt={`Flag of ${code}`}
    />
  )
}

export default Flag
