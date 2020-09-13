import { RouteComponentProps } from "@reach/router"
import React from "react"
import { Helmet } from "react-helmet-async"
import Suggestions from "./Suggestions"

const PlusPage: React.FC<RouteComponentProps> = () => {
  return (
    <>
      <Helmet>
        <title>Plus Server suggested and vouched players | sendou.ink</title>
      </Helmet>
      <Suggestions />
    </>
  )
}

export default PlusPage
