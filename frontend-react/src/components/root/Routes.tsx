import React, { Suspense, lazy } from "react"
import { Router } from "@reach/router"

const UserPage = lazy(() => import("../user/UserPage"))

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <UserPage path="/u/:id" />
      </Router>
    </Suspense>
  )
}

export default Routes
