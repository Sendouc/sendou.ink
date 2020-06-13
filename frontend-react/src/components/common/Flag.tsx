import React from "react"
import { CountryCode } from "../../types"
import { countries } from "../../utils/lists"

interface FlagProps {
  code: CountryCode
  size?: "16" | "32"
}

const Flag: React.FC<FlagProps> = ({ code, size = "16" }) => {
  return (
    <img
      src={`https://www.countryflags.io/${code}/flat/${size}.png`}
      style={{
        display: "inline",
        margin: "0 8px",
        width: `${size}px`,
        height: `${size}px`,
      }}
      alt={`Flag of ${code}`}
      title={countries.find((obj) => obj.code === code)?.name}
    />
  )
}

export default Flag
