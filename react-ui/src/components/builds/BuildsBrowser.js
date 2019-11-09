import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import useUrlParamQuery from "../../hooks/useUrlParamQuery"
import WeaponDropdown from "../common/WeaponDropdown"
import { searchForBuildsByWeapon } from "../../graphql/queries/searchForBuildsByWeapon"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { Card, Header } from "semantic-ui-react"
import BuildCard from "../common/BuildCard"
import WpnImage from "../common/WpnImage"

const BuildsBrowser = () => {
  const location = useLocation()
  const weaponFromUrl = () => {
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.has("weapon")) return searchParams.get("weapon")
    return ""
  }
  const [weapon, setWeapon] = useState(weaponFromUrl())
  console.log("weapon", weapon)
  const { data, error, loading, filter, fireQuery } = useUrlParamQuery(
    searchForBuildsByWeapon,
    {
      weapon
    }
  )

  const handleFormChange = (e, { value }) => {
    setWeapon(value)
    fireQuery({ ...filter, weapon: value })
  }

  useEffect(() => {
    if (!weapon) document.title = "Builds - sendou.ink"
    document.title = `${weapon} Builds - sendou.ink`
  }, [weapon])

  const weaponsList = () => {
    if (loading || !data) return <Loading />
    if (error) return <Error errorMessage={error.message} />
    console.log("data", data)
    return (
      <>
        <Header as="h2">
          {weapon ? (
            <>
              <WpnImage weapon={weapon} /> {weapon} Builds
            </>
          ) : (
            <>Latest Builds</>
          )}
        </Header>
        <Card.Group style={{ marginTop: "1em" }}>
          {data.searchForBuildsByWeapon.builds.map(build => {
            return <BuildCard key={build.id} build={build} showWeapon={false} />
          })}
        </Card.Group>
      </>
    )
  }

  return (
    <>
      <WeaponDropdown value={filter.weapon} onChange={handleFormChange} />
      <div style={{ marginTop: "1em" }}>{weaponsList()}</div>
    </>
  )
}

export default BuildsBrowser
