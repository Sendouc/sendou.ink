import React, { Suspense, lazy } from "react"
import { Router } from "@reach/router"
import Loading from "../common/Loading"

const UserPage = lazy(() => import("../user/UserPage"))
const BuildsPage = lazy(() => import("../builds/BuildsPage"))

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <UserPage path="/u/:id" />
      </Router>
      <Router>
        <BuildsPage path="/builds" />
      </Router>
    </Suspense>
  )
}

export default Routes
