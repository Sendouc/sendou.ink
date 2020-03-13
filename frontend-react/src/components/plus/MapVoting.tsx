import React, { useState, useEffect } from "react"
import { RouteComponentProps } from "@reach/router"
import { useQuery } from "@apollo/react-hooks"
import { MAP_VOTES, MapVotesData } from "../../graphql/queries/mapVotes"
import Error from "../common/Error"
import Loading from "../common/Loading"
import { Helmet } from "react-helmet-async"
import PageHeader from "../common/PageHeader"
import MapVoteGrid from "./MapVoteGrid"
import { Box } from "@chakra-ui/core"
import Button from "../elements/Button"
import { FaEnvelope } from "react-icons/fa"

const MapVoting: React.FC<RouteComponentProps> = ({}) => {
  const { data, error, loading } = useQuery<MapVotesData>(MAP_VOTES)
  const [votes, setVotes] = useState<
    {
      name: string
      sz: -1 | 0 | 1
      tc: -1 | 0 | 1
      rm: -1 | 0 | 1
      cb: -1 | 0 | 1
    }[]
  >([])

  useEffect(() => {
    if (loading || error || !data) {
      return
    }

    setVotes(data.mapVotes)
  }, [data])

  if (error) return <Error errorMessage={error.message} />
  if (loading) return <Loading />

  return (
    <>
      <Helmet>
        <title>Plus Server Map Voting | sendou.ink</title>
      </Helmet>
      <PageHeader title="Map Voting" />
      <MapVoteGrid votes={votes} setVotes={setVotes} />
      <Box>
        <Button icon={FaEnvelope}>Submit</Button>
      </Box>
    </>
  )
}

export default MapVoting
