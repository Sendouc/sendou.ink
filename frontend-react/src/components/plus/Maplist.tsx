import React, { useContext } from "react"
import { Heading, Flex, Box, Avatar } from "@chakra-ui/core"
import { mapIcons } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { Stage } from "../../types"

interface MaplistCardProps {
  title: string
  stages: Stage[]
}

const MaplistCard: React.FC<MaplistCardProps> = ({ title, stages }) => {
  const { themeColorHex } = useContext(MyThemeContext)
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
        {title}
      </Heading>
      <Flex alignItems="center" justifyContent="center" flexWrap="wrap">
        {stages.map(stage => {
          return (
            <Avatar
              src={mapIcons[stage]}
              size="lg"
              my="5px"
              mr="0.5em"
              title={stage}
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
        <MaplistCard stages={sz} title="Splat Zones" />
        <MaplistCard stages={tc} title="Tower Control" />
        <MaplistCard stages={rm} title="Rainmaker" />
        <MaplistCard stages={cb} title="Clam Blitz" />
      </Flex>
    </>
  )
}

export default Maplist
