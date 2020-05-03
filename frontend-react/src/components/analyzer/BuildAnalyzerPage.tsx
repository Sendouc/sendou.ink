import React, { useState } from "react"
import { RouteComponentProps } from "@reach/router"
import PageHeader from "../common/PageHeader"
import { Build } from "../../types"
import EditableBuild from "./EditableBuild"

const BuildAnalyzerPage: React.FC<RouteComponentProps> = () => {
  const [build, setBuild] = useState<Partial<Build>>({
    headgear: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    clothing: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    shoes: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  })

  return (
    <>
      <PageHeader title="Build Analyzer" />
      <EditableBuild build={build} setBuild={setBuild} />
    </>
  )
}

export default BuildAnalyzerPage
