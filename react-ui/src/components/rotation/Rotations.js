import React, { useEffect, useState } from "react"
import { useQuery } from "@apollo/react-hooks"
import { rotationData } from "../../graphql/queries/rotationData"
import { maplists } from "../../graphql/queries/maplists"
import { Button } from "semantic-ui-react"

import Loading from "../common/Loading"
import Error from "../common/Error"
import MapPreferenceSelector from "./MapPreferenceSelector"
import RotationSegments from "./RotationSegments"

const Rotations = ({ setMenuSelection }) => {
  const { data, error, loading } = useQuery(rotationData)
  const monthly = useQuery(maplists)
  const [rotation, setRotation] = useState([])
  const [preferences, setPreferences] = useState({
    sz: {},
    tc: {},
    rm: {},
    cb: {}
  })

  const [show, setShow] = useState(false)

  useEffect(() => {
    if (loading || monthly.loading) {
      return
    }

    document.title = "Rotations - sendou.ink"
    const rotationPreferencesFromDb = window.localStorage.getItem(
      "rotationPreferences"
    )
    if (rotationPreferencesFromDb) {
      setPreferences(JSON.parse(rotationPreferencesFromDb))
    }

    setRotation(JSON.parse(data.rotationData))
  }, [data, loading, monthly.loading])

  if (loading || monthly.loading || rotation.length === 0) return <Loading />
  if (error || monthly.error) return <Error />

  const monthlyMaps = monthly.data.maplists[0]

  return (
    <>
      <Button icon="cog" onClick={() => setShow(!show)} />
      {show ? (
        <div style={{ margin: "1em auto 1em" }}>
          Uncheck a map in the ranked rotation to mark it as a disliked map.
          <MapPreferenceSelector maps={monthlyMaps} preferences={preferences} />
        </div>
      ) : null}
      <div>
        <RotationSegments rotation={rotation} preferences={preferences} />
      </div>
    </>
  )
}

export default Rotations
