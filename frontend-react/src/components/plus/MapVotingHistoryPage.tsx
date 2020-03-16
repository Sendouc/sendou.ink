import React, { useState, useEffect, useContext } from "react"
import { useQuery } from "@apollo/react-hooks"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { months } from "../../utils/lists"
import { RouteComponentProps } from "@reach/router"
import { Flex, Heading, Avatar } from "@chakra-ui/core"
import PageHeader from "../common/PageHeader"
import { Helmet } from "react-helmet-async"
import {
  PLUS_MAPLISTS,
  PlusMaplistsData,
} from "../../graphql/queries/plusMaplists"
import MyThemeContext from "../../themeContext"
import { Stage } from "../../types"
import { mapIcons } from "../../assets/imageImports"

interface MaplistCardProps {
  title: string
  voteCounts: {
    name: Stage
    sz: number[]
    tc: number[]
    rm: number[]
    cb: number[]
  }[]
}

/*const MaplistCard: React.FC<MaplistCardProps> = ({ title, voteCounts }) => {
  const { themeColorHex } = useContext(MyThemeContext)
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
          {title}
        </Heading>
        <Flex alignItems="center" justifyContent="center" flexWrap="wrap">
          {voteCounts.map(stage => {
            return (
              <Flex key={stage}>
                <Avatar
                  src={mapIcons[stage]}
                  size="lg"
                  my="5px"
                  mr="0.5em"
                  title={stage}
                />
              </Flex>
            )
          })}
        </Flex>
      </Flex>
    </>
  )
}*/

const MapVotingHistoryPage: React.FC<RouteComponentProps> = () => {
  const { data, error, loading } = useQuery<PlusMaplistsData>(PLUS_MAPLISTS)
  const [index, setIndex] = useState(0)

  if (error) return <Error errorMessage={error.message} />
  if (loading || !data) return <Loading />

  return (
    <>
      <Helmet>
        <title>Plus Server Map Voting History | sendou.ink</title>
      </Helmet>
      <PageHeader title="Map Voting History" />
      {/*<MaplistCard />*/}
    </>
  )
}

export default MapVotingHistoryPage
