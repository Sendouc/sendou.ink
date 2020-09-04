import React, { useContext } from "react"
import { Heading, Flex, Box, Avatar, Icon, AvatarBadge } from "@chakra-ui/core"
import { mapIcons } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { Stage } from "../../types"

interface MaplistCardProps {
  modeShort: string
  stages: Stage[]
  newMaps: Stage[]
}

const MaplistCard: React.FC<MaplistCardProps> = ({
  modeShort,
  stages,
  newMaps,
}) => {
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
        <Icon
          name={modeShort as any}
          color={themeColorWithShade}
          w="2em"
          h="2em"
        />
      </Heading>
      <Flex alignItems="center" justifyContent="center" flexWrap="wrap">
        {stages.map((stage) => {
          return (
            <Avatar
              key={stage}
              src={mapIcons[stage]}
              size="lg"
              my="5px"
              mx="0.2em"
              title={stage}
              textAlign="center"
            >
              {newMaps.includes(stage) && (
                <AvatarBadge h="1em" w="1em" bg={themeColorWithShade} />
              )}
            </Avatar>
          )
        })}
      </Flex>
    </Flex>
  )
}

interface MaplistProps {
  name: string
  sz: string[]
  pastSz: string[]
  tc: string[]
  pastTc: string[]
  rm: string[]
  pastRm: string[]
  cb: string[]
  pastCb: string[]
  voterCount: number
}

const Maplist: React.FC<MaplistProps> = ({
  name,
  sz,
  pastSz,
  tc,
  pastTc,
  rm,
  pastRm,
  cb,
  pastCb,
  voterCount,
}) => {
  const { grayWithShade, themeColorWithShade } = useContext(MyThemeContext)

  const lastMonth = [pastSz, pastTc, pastRm, pastCb]
  const thisMonth = [sz, tc, rm, cb]
  const toAdd = ["SZ", "TC", "RM", "CB"]

  let goneMaps: Stage[] = []

  lastMonth.forEach((arr, index) => {
    const append = toAdd[index]
    const newOfTheMode = arr
      .filter((map) => !thisMonth[index].includes(map))
      .map((map) => `${map} (${append})`)

    goneMaps = [...goneMaps, ...newOfTheMode]
  })

  const newMaps: Stage[][] = []

  thisMonth.forEach((arr, index) => {
    const newOfTheMode = arr.filter((map) => !lastMonth[index].includes(map))

    newMaps.push(newOfTheMode)
  })

  return (
    <>
      <Heading size="lg">{name} maps</Heading>
      <Box color={grayWithShade}>Based on {voterCount} votes</Box>
      <Flex flexWrap="wrap" pt="1em">
        <MaplistCard stages={sz} modeShort="sz" newMaps={newMaps[0]} />
        <MaplistCard stages={tc} modeShort="tc" newMaps={newMaps[1]} />
        <MaplistCard stages={rm} modeShort="rm" newMaps={newMaps[2]} />
        <MaplistCard stages={cb} modeShort="cb" newMaps={newMaps[3]} />
      </Flex>
      {goneMaps.length > 0 && (
        <Box color={grayWithShade} fontSize="0.8em">
          Maps gone since last month: {goneMaps.join(", ")}. New maps marked
          with{" "}
          <Box
            h="15px"
            w="15px"
            backgroundColor={themeColorWithShade}
            display="inline-block"
            borderRadius="50%"
          />
        </Box>
      )}
    </>
  )
}

export default Maplist
