import React from "react"
import { RouteComponentProps } from "@reach/router"
import {
  SEARCH_FOR_DRAFT_CUP,
  SearchForDraftCupData,
  SearchForDraftCupVars,
} from "../../graphql/queries/searchForDraftCup"
import { useQuery } from "@apollo/react-hooks"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { DraftTournamentCard } from "./DraftTournamentCards"
import Button from "../elements/Button"
import { FaExternalLinkAlt } from "react-icons/fa"
import { Box } from "@chakra-ui/core"

interface DraftCupDetailsProps {
  id?: string
}

const DraftCupDetails: React.FC<RouteComponentProps & DraftCupDetailsProps> = ({
  id,
}) => {
  const idParts = id!.split("-")
  const { data, error, loading } = useQuery<
    SearchForDraftCupData,
    SearchForDraftCupVars
  >(SEARCH_FOR_DRAFT_CUP, { variables: { name: "+2 Draft Cup March 2020" } })

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  console.log("data", data)

  const { tournament, matches } = data!.searchForDraftCup

  return (
    <>
      <DraftTournamentCard tournament={tournament} />
      <Box mt="1em">
        <a href={tournament.bracket_url}>
          <Button icon={FaExternalLinkAlt} outlined>
            Bracket
          </Button>
        </a>
      </Box>
    </>
  )
}

export default DraftCupDetails
