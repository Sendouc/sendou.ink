import { Box } from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import React from "react"
import { Helmet } from "react-helmet-async"
import Chart from "./Chart"
import TeamPlayer from "./TeamPlayer"
import LogoHeader from "./LogoHeader"

const TeamPage: React.FC<RouteComponentProps> = () => {
  /*const { data, error, loading } = useQuery<
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
  const user = userData.user*/

  return (
    <>
      <Helmet>
        <title>Scoze Gaming | sendou.ink</title>
      </Helmet>
      <Chart countries={["fi", "fr", "nl"]} />
      <LogoHeader name="Scoze Gaming" />
      <TeamPlayer
        username="Sendou"
        avatar="https://cdn.discordapp.com/avatars/79237403620945920/a22c9557975494f859242aaf9b317058."
        weapons={[
          "Tenta Brella",
          "N-ZAP '85",
          "Rapid Blaster Pro",
          "Foil Flingza Roller",
        ]}
        role="Support"
        country="fi"
      />
      <Box my="4em">
        <TeamPlayer
          username="Brian"
          avatar="https://cdn.discordapp.com/avatars/81154649993785344/6632c59857ad4266f61eabc62d917ef6."
          weapons={[
            "Splatterscope",
            "Heavy Splatling Remix",
            "Explosher",
            "Sploosh-o-matic 7",
          ]}
          role="Backline"
          country="nl"
        />
      </Box>
      <Box my="4em">
        <TeamPlayer
          username="kurisu"
          avatar="https://cdn.discordapp.com/avatars/601212946420334635/7125efcf758514841c93e6398f17de3a."
          weapons={[
            "Kensa Splattershot",
            "Enperry Splat Dualies",
            "Foil Squeezer",
          ]}
          role="Frontline"
          country="fr"
        />
      </Box>
      <Box my="4em">
        <TeamPlayer
          username="SkoXay"
          avatar="https://cdn.discordapp.com/avatars/427319047785545759/a_e371e275e604e31b155c7f66e3cbce48."
          weapons={["L-3 Nozzlenose", "L-3 Nozzlenose D"]}
          role="Frontline"
          country="fr"
        />
      </Box>
    </>
  )
}

export default TeamPage
