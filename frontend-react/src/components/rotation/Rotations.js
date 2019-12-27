import React, { useEffect, useState } from "react"
import { useQuery } from "@apollo/react-hooks"
import { rotationData } from "../../graphql/queries/rotationData"

import Loading from "../common/Loading"
import Error from "../common/Error"
import RotationSegments from "./RotationSegments"

const Rotations = () => {
  const { data, error, loading } = useQuery(rotationData)
  const [rotation, setRotation] = useState([])

  useEffect(() => {
    if (loading) {
      return
    }

    document.title = "Rotations - sendou.ink"

    setRotation(JSON.parse(data.rotationData))
  }, [data, loading])

  if (loading || rotation.length === 0) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  return (
    <>
      <RotationSegments rotation={rotation} />
    </>
  )
}

export default Rotations
