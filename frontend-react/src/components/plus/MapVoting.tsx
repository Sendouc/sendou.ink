import React, { useState, useEffect } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { useQuery, useMutation } from "@apollo/react-hooks"
import { MAP_VOTES, MapVotesData } from "../../graphql/queries/mapVotes"
import Error from "../common/Error"
import Loading from "../common/Loading"
import { Helmet } from "react-helmet-async"
import PageHeader from "../common/PageHeader"
import MapVoteGrid from "./MapVoteGrid"
import { Box, useToast } from "@chakra-ui/core"
import Button from "../elements/Button"
import { FaEnvelope, FaLongArrowAltLeft } from "react-icons/fa"
import {
  AddMapVotesVars,
  ADD_MAP_VOTES,
} from "../../graphql/mutations/addMapVotes"
import Alert from "../elements/Alert"

const MapVoting: React.FC<RouteComponentProps> = ({}) => {
  const { data, error, loading } = useQuery<MapVotesData>(MAP_VOTES)
  const toast = useToast()
  const [votes, setVotes] = useState<
    {
      name: string
      sz: -1 | 0 | 1
      tc: -1 | 0 | 1
      rm: -1 | 0 | 1
      cb: -1 | 0 | 1
    }[]
  >([])

  const [addMapVotes] = useMutation<boolean, AddMapVotesVars>(ADD_MAP_VOTES, {
    variables: { votes },
    onCompleted: data => {
      window.scrollTo(0, 0)
      toast({
        description: `Map votes submitted`,
        position: "top-right",
        status: "success",
        duration: 10000,
      })
    },
    onError: error => {
      toast({
        title: "An error occurred",
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      })
    },
    refetchQueries: [{ query: MAP_VOTES }],
  })

  useEffect(() => {
    if (loading || error || !data) {
      return
    }

    // this is to remove the __typename property
    setVotes(
      data.mapVotes.map(vote => ({
        name: vote.name,
        sz: vote.sz,
        tc: vote.tc,
        rm: vote.rm,
        cb: vote.cb,
      }))
    )
  }, [data, error, loading])

  if (error) return <Error errorMessage={error.message} />
  if (loading) return <Loading />

  return (
    <>
      <Helmet>
        <title>Plus Server Map Voting | sendou.ink</title>
      </Helmet>
      <PageHeader title="Map Voting" />
      <Link to="/plus">
        <Button outlined icon={FaLongArrowAltLeft}>
          Back to actions page
        </Button>
      </Link>
      <Alert status="info">
        You can update your votes as often as you wish but new map list is only
        generated monthly
      </Alert>
      <MapVoteGrid votes={votes} setVotes={setVotes} />
      <Button icon={FaEnvelope} onClick={() => addMapVotes()}>
        Submit
      </Button>
    </>
  )
}

export default MapVoting
