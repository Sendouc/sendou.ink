import React, { useContext } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { Box } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface USAChartProps {
  states: string[]
}

const USAChart: React.FC<USAChartProps> = ({ states }) => {
  const { bgColor, themeColorHex } = useContext(MyThemeContext)
  return (
    <Box w="75%" mx="auto">
      <ComposableMap projection="geoAlbersUsa">
        <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
          {({ geographies }) => (
            <>
              {geographies.map((geo) => {
                console.log("geo", geo)
                return (
                  <Geography
                    key={geo.rsmKey}
                    stroke={themeColorHex}
                    geography={geo}
                    fill={
                      states.includes(geo.properties.name)
                        ? themeColorHex
                        : bgColor
                    }
                  />
                )
              })}
              {geographies.map((geo) => {
                return <g key={geo.rsmKey + "-name"} />
              })}
            </>
          )}
        </Geographies>
      </ComposableMap>
    </Box>
  )
}

export default USAChart
