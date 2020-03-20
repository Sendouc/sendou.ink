import React, { useContext } from "react"
import { Heading, Flex, Box, Avatar, Icon } from "@chakra-ui/core"
import { mapIcons } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { Stage } from "../../types"

interface MaplistCardProps {
  modeShort: string
  stages: Stage[]
}

const MaplistCard: React.FC<MaplistCardProps> = ({ modeShort, stages }) => {
  const { themeColorHex, themeColorWithShade } = useContext(MyThemeContext)
  return (
    <Flex
      flexDirection="column"
      rounded="lg"
      overflow="hidden"
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="15px"
      mr="1em"
      mb="1em"
      w="350px"
    >
      <Heading textAlign="center" mb="0.5em" color={themeColorHex}>
        <Icon name={modeShort as any} color={themeColorWithShade} size="2em" />
      </Heading>
      <Flex alignItems="center" justifyContent="center" flexWrap="wrap">
        {stages.map(stage => {
          return (
            <Avatar
              key={stage}
              src={mapIcons[stage]}
              size="lg"
              my="5px"
              mx="0.2em"
              title={stage}
              textAlign="center"
            />
          )
        })}
      </Flex>
    </Flex>
  )
}

interface MaplistProps {
  name: string
  sz: string[]
  tc: string[]
  rm: string[]
  cb: string[]
  voterCount: number
}

const Maplist: React.FC<MaplistProps> = ({
  name,
  sz,
  tc,
  rm,
  cb,
  voterCount,
}) => {
  return (
    <>
      <Heading size="lg">{name} maps</Heading>
      <Box>Based on {voterCount} votes</Box>
      <Flex flexWrap="wrap" pt="1em">
        <MaplistCard stages={sz} modeShort="sz" />
        <MaplistCard stages={tc} modeShort="tc" />
        <MaplistCard stages={rm} modeShort="rm" />
        <MaplistCard stages={cb} modeShort="cb" />
      </Flex>
    </>
  )
}

export default Maplist
