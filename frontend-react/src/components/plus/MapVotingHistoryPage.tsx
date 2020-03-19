import React, { useState, useEffect, useContext } from "react"
import { useQuery } from "@apollo/react-hooks"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { months } from "../../utils/lists"
import { RouteComponentProps } from "@reach/router"
import { Flex, Heading, Avatar, Box, Icon } from "@chakra-ui/core"
import PageHeader from "../common/PageHeader"
import { Helmet } from "react-helmet-async"
import {
  PLUS_MAPLISTS,
  PlusMaplistsData,
} from "../../graphql/queries/plusMaplists"
import MyThemeContext from "../../themeContext"
import { Stage } from "../../types"
import { mapIcons } from "../../assets/imageImports"
import { FaCheck, FaArrowLeft, FaArrowRight } from "react-icons/fa"
import Alert from "../elements/Alert"
import IconButton from "../elements/IconButton"

interface MaplistCardProps {
  maplist: Stage[]
  voteCounts: {
    name: Stage
    sz: number[]
    tc: number[]
    rm: number[]
    cb: number[]
  }[]
  modeShort: "sz" | "tc" | "rm" | "cb"
}

const MaplistCard: React.FC<MaplistCardProps> = ({
  maplist,
  voteCounts,
  modeShort,
}) => {
  const {
    grayWithShade,
    themeColorHex,
    colorMode,
    themeColorWithShade,
  } = useContext(MyThemeContext)

  const votedMaps = voteCounts.reduce((acc, cur) => {
    const maxScore =
      (cur[modeShort][0] + cur[modeShort][1] + cur[modeShort][2]) * 2
    const score = +(
      ((cur[modeShort][1] * 1 + cur[modeShort][2] * 2) / maxScore) *
      100
    ).toFixed(2)
    const mapObject = { name: cur.name, score, votes: cur[modeShort] }
    return [...acc, mapObject]
  }, [] as { name: string; score: number; votes: number[] }[])

  votedMaps.sort((a, b) => b.score - a.score)

  const shade = colorMode === "light" ? "600" : "400"

  return (
    <>
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
            size="2em"
          />
        </Heading>
        <Flex alignItems="center" flexWrap="wrap">
          {votedMaps.map(stage => {
            return (
              <Flex key={stage.name} my="0.5em">
                <Avatar
                  src={mapIcons[stage.name]}
                  size="lg"
                  my="5px"
                  mr="0.5em"
                  title={stage.name}
                />
                <Flex flexDirection="column">
                  <Box
                    color={
                      maplist.indexOf(stage.name) !== -1
                        ? "green.500"
                        : grayWithShade
                    }
                  >
                    <b>{stage.name}</b>
                  </Box>
                  <Box fontSize="20px">
                    <b>{stage.score}%</b>
                  </Box>
                  <Box fontSize="18px">
                    <Box as="span" color={`red.${shade}`}>
                      {stage.votes[0]}
                    </Box>{" "}
                    {stage.votes[1]}{" "}
                    <Box as="span" color={`green.${shade}`}>
                      {stage.votes[2]}
                    </Box>
                  </Box>
                </Flex>
              </Flex>
            )
          })}
        </Flex>
      </Flex>
    </>
  )
}

const MapVotingHistoryPage: React.FC<RouteComponentProps> = () => {
  const { data, error, loading } = useQuery<PlusMaplistsData>(PLUS_MAPLISTS)
  const [index, setIndex] = useState(0)

  if (error) return <Error errorMessage={error.message} />
  if (loading || !data) return <Loading />

  const maplistObject = data.plusMaplists[index]

  return (
    <>
      <Helmet>
        <title>Plus Server Map Voting History | sendou.ink</title>
      </Helmet>
      <PageHeader title="Map Voting History" />
      <Flex justifyContent="center" alignItems="center">
        <IconButton
          icon={FaArrowLeft}
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        />
        <Heading size="lg">{maplistObject.name}</Heading>
        <IconButton
          icon={FaArrowRight}
          disabled={index === data.plusMaplists.length - 1}
          onClick={() => setIndex(index + 1)}
        />
      </Flex>
      <Flex flexWrap="wrap" mt="1em" justifyContent="center">
        <MaplistCard
          modeShort="sz"
          maplist={maplistObject.sz}
          voteCounts={maplistObject.plus.vote_counts}
        />
        <MaplistCard
          modeShort="tc"
          maplist={maplistObject.tc}
          voteCounts={maplistObject.plus.vote_counts}
        />
        <MaplistCard
          modeShort="rm"
          maplist={maplistObject.rm}
          voteCounts={maplistObject.plus.vote_counts}
        />
        <MaplistCard
          modeShort="cb"
          maplist={maplistObject.cb}
          voteCounts={maplistObject.plus.vote_counts}
        />
      </Flex>
    </>
  )
}

export default MapVotingHistoryPage
