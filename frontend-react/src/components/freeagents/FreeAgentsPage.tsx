import React from "react"
import { useQuery } from "@apollo/react-hooks"
import { USER } from "../../graphql/queries/user"
import { UserData, FreeAgentPostsData } from "../../types"
import { FREE_AGENT_POSTS } from "../../graphql/queries/freeAgentPosts"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { RouteComponentProps } from "@reach/router"
import PostsAccordion from "./PostsAccordion"
import PageHeader from "../common/PageHeader"
import { Helmet } from "react-helmet-async"

const FreeAgentsPage: React.FC<RouteComponentProps> = () => {
  const { data, error, loading } = useQuery<FreeAgentPostsData>(
    FREE_AGENT_POSTS
  )
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery<UserData>(USER)

  if (loading || userQueryLoading || !data) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />

  const faPosts = data.freeAgentPosts

  return (
    <>
      <Helmet>
        <title>Free Agents | sendou.ink</title>
      </Helmet>
      <PageHeader title="Free Agents" />
      <PostsAccordion posts={faPosts} />
    </>
  )
}

export default FreeAgentsPage
