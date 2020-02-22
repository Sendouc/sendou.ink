import React from "react"
import { RouteComponentProps, Redirect } from "@reach/router"
import { useQuery } from "@apollo/react-hooks"
import { SEARCH_FOR_TEAM } from "../../graphql/queries/searchForTeam"
import { Team, UserData } from "../../types"
import Loading from "../common/Loading"
import Error from "../common/Error"
import LogoHeader from "./LogoHeader"
import MemberCard from "./MemberCard"
import Box from "../elements/Box"
import { Helmet } from "react-helmet-async"
import Results from "./Results"
import { USER } from "../../graphql/queries/user"

interface SearchForTeamData {
  searchForTeam: Team
}

interface SearchForTeamVars {
  name: string
}

interface TeamPageProps {
  name?: string
}

const TeamPage: React.FC<RouteComponentProps & TeamPageProps> = ({ name }) => {
  const { data, error, loading } = useQuery<
    SearchForTeamData,
    SearchForTeamVars
  >(SEARCH_FOR_TEAM, {
    variables: { name: name as string },
    skip: !name,
  })
  const { data: userData, error: userError, loading: userLoading } = useQuery<
    UserData
  >(USER)

  if (!name) return <Redirect to="/404" />
  if (loading || userLoading) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  if (userError) return <Error errorMessage={userError.message} />
  if (!data || !data.searchForTeam || !userData) return <Redirect to="/404" />

  const team = data.searchForTeam
  const user = userData.user

  return (
    <>
      <Helmet>
        <title>{team.name} | sendou.ink</title>
      </Helmet>
      <LogoHeader name={team.name} twitter_name={team.twitter_name} />
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        {team.member_users.map(member => (
          <Box key={member.discord_id} p="0.5em">
            <MemberCard member={member} />
          </Box>
        ))}
      </Box>
      <Box mt="1em">
        <Results
          results={team.tournament_results.sort(
            (a, b) => parseInt(b.date) - parseInt(a.date)
          )}
          canAddResults={
            team.captain_discord_id === user?.discord_id &&
            team.tournament_results.length < 100
          }
        />
      </Box>
    </>
  )
}

export default TeamPage
