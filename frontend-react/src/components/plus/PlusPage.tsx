import React, { useState } from "react"
import { useQuery } from "@apollo/react-hooks"

import Suggestions from "./Suggestions"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { PLUS_INFO } from "../../graphql/queries/plusInfo"
import { USER } from "../../graphql/queries/user"
//import Voting from "./Voting"
import { Redirect, RouteComponentProps } from "@reach/router"
import PageHeader from "../common/PageHeader"

interface PlusInfoData {
  plusInfo: {
    voting_ends?: String
    voter_count: number
    eligible_voters: number
  }
}

const PlusPage: React.FC<RouteComponentProps> = () => {
  const [showSuggestionForm, setShowSuggestionForm] = useState(false)

  const { data, error, loading } = useQuery<PlusInfoData>(PLUS_INFO)
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery(USER)

  if (error) return <Error errorMessage={error.message} />
  if (loading || userQueryLoading || !data) return <Loading />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />
  if (!userData.user) return <Redirect to="/access" />
  if (!data.plusInfo) return <Redirect to="/404" />

  return (
    <>
      <PageHeader title="Plus Server" />
      {/*Inv link here*/}
      {/*data.plusInfo.voting_ends && userData.user.plus?.membership_status ? (
        <Voting
          user={userData.user}
          handleSuccess={handleSuccess}
          handleError={handleError}
          votedSoFar={data.plusInfo.voter_count}
          eligibleVoters={data.plusInfo.eligible_voters}
          votingEnds={
            data.plusInfo.voting_ends
              ? parseInt(data.plusInfo.voting_ends)
              : null
          }
        />
      ) : (
        <Suggestions
          user={userData.user}
          plusServer={userData.user?.plus?.membership_status}
          showSuggestionForm={showSuggestionForm}
          setShowSuggestionForm={setShowSuggestionForm}
          handleSuccess={handleSuccess}
          handleError={handleError}
        />
      )*/}
      <Suggestions user={userData.user} />
    </>
  )
}

export default PlusPage
