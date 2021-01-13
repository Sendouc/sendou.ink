import { Box } from "@chakra-ui/react";
import { useMyTheme } from "lib/useMyTheme";
import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

interface ChartProps {
  countries: string[];
}

const Chart: React.FC<ChartProps> = ({ countries }) => {
  const { themeColorHex, bgColor } = useMyTheme();
  return (
    <Box w="75%" mx="auto">
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [-20.0, -52.0, 0],
          scale: 700,
        }}
      >
        <Geographies geography="https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json">
          {({ geographies }) =>
            geographies.map((geo) => {
              const { REGION_UN, ISO_A2 } = geo.properties;
              if (REGION_UN !== "Europe") return null;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={
                    countries.map((c) => c.toUpperCase()).includes(ISO_A2)
                      ? themeColorHex
                      : bgColor
                  }
                  stroke={themeColorHex}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </Box>
  );
};

export default Chart;
