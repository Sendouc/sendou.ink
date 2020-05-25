import React, { useContext } from "react"
import MyThemeContext from "../../themeContext"
import {
  Flex,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/core"
import AbilityIcon from "../builds/AbilityIcon"

interface LdeSliderProps {
  value: number
  setValue: (value: number) => void
}

const LdeSlider: React.FC<LdeSliderProps> = ({ value, setValue }) => {
  const { themeColor, themeColorWithShade } = useContext(MyThemeContext)
  const bonusAp = Math.floor((24 / 21) * value)
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      mb="1em"
    >
      <Slider
        value={value}
        onChange={(value: number) => setValue(value)}
        max={21}
      >
        <SliderTrack bg={`${themeColor}.100`} />
        <SliderFilledTrack bg={themeColorWithShade} />
        <SliderThumb size={6}>
          <Box minW="30px">
            <AbilityIcon ability="LDE" size="TINY" />
          </Box>
        </SliderThumb>
      </Slider>
      {value > 1 && (
        <Box color={themeColorWithShade} fontWeight="bold" mt="1em">
          +{bonusAp}AP{" "}
          {["ISM", "ISS", "REC"].map((ability) => (
            <Box as="span" mx="0.2em" key={ability}>
              <AbilityIcon ability={ability as any} size="SUBTINY" />
            </Box>
          ))}
        </Box>
      )}
    </Flex>
  )
}

export default LdeSlider
