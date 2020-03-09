import React from "react"
import { RouteComponentProps } from "@reach/router"

interface ScrollProps {
  children: any
  location?: any
}

export const ScrollToTop: React.FC<ScrollProps & RouteComponentProps> = ({
  children,
  location,
}) => {
  React.useLayoutEffect(() => window.scrollTo(0, 0), [location.pathname])
  return children
}
