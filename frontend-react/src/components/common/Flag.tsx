import React from "react"
import { CountryCode } from "../../types"
import { countries } from "../../utils/lists"

interface FlagProps {
  code: CountryCode
}

const Flag: React.FC<FlagProps> = ({ code }) => {
  return (
    <img
      src={`https://www.countryflags.io/${code}/flat/16.png`}
      style={{
        display: "inline",
        margin: "0 8px",
        width: "16px",
        height: "16px",
      }}
      alt={`Flag of ${code}`}
      title={countries.find((obj) => obj.code === code)?.name}
    />
  )
}

export default Flag
