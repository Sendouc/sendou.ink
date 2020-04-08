import React from "react"
import { RouteComponentProps } from "@reach/router"
import { useQuery } from "@apollo/react-hooks"
import { XTrendsData, X_TRENDS } from "../../graphql/queries/xTrends"
import Loading from "../common/Loading"
import Error from "../common/Error"
import PageHeader from "../common/PageHeader"

interface XTrendsPageProps {}

const XTrendsPage: React.FC<RouteComponentProps> = () => {
  const { data, error, loading } = useQuery<XTrendsData>(X_TRENDS)

  if (error) return <Error errorMessage={error.message} />
  if (loading) return <Loading />

  console.log("xtrends", data!.xTrends)
  return (
    <>
      <PageHeader title="X Trends" />
      {data!.xTrends.length}
    </>
  )
}

export default XTrendsPage
