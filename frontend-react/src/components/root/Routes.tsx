import React, { Suspense, lazy } from "react"
import { Router } from "@reach/router"
import Loading from "../common/Loading"

const UserPage = lazy(() => import("../user/UserPage"))

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <UserPage path="/u/:id" />
      </Router>
    </Suspense>
  )
}

export default Routes
