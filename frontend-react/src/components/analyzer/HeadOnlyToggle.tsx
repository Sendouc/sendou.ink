import React, { useContext } from "react"
import { Box, Switch, FormLabel, Flex } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import AbilityIcon from "../builds/AbilityIcon"

interface HeadOnlyToggleProps {
  ability: "OG" | "CB"
  active: boolean
  setActive: () => void
}

const HeadOnlyToggle: React.FC<HeadOnlyToggleProps> = ({
  ability,
  active,
  setActive,
}) => {
  const { themeColor, themeColorWithShade } = useContext(MyThemeContext)
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      mb="1em"
    >
      <Box>
        <Switch
          id="show-all"
          color={themeColor}
          isChecked={active}
          onChange={() => setActive()}
          mr="0.5em"
        />
        <FormLabel htmlFor="show-all">
          <AbilityIcon ability={ability} size="TINY" />
        </FormLabel>
      </Box>
      {active && ability === "OG" && (
        <Box color={themeColorWithShade} fontWeight="bold" mt="1em">
          +15AP{" "}
          {["SSU", "RSU", "RES"].map((ability) => (
            <Box as="span" mx="0.2em" key={ability}>
              <AbilityIcon ability={ability as any} size="SUBTINY" />
            </Box>
          ))}
        </Box>
      )}
      {active && ability === "CB" && (
        <Box color={themeColorWithShade} fontWeight="bold" mt="1em">
          +10AP{" "}
          {["ISM", "ISS", "REC", "RSU", "SSU", "SCU"].map((ability) => (
            <Box as="span" mx="0.2em" key={ability}>
              <AbilityIcon ability={ability as any} size="SUBTINY" />
            </Box>
          ))}
        </Box>
      )}
    </Flex>
  )
}

export default HeadOnlyToggle
