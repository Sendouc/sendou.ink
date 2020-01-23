import React from "react"
import { Helmet } from "react-helmet-async"
import { RouteComponentProps } from "@reach/router"
import WeaponSelector from "../common/WeaponSelector"
import { useState } from "react"
import { Weapon } from "../../types"
import useBreakPoints from "../../hooks/useBreakPoints"

const BuildsPage: React.FC<RouteComponentProps> = () => {
  const [weapon, setWeapon] = useState<Weapon | null>(null)
  const isSmall = useBreakPoints(870)
  return (
    <>
      <Helmet>
        <title>Builds | sendou.ink</title>
      </Helmet>
      <WeaponSelector
        weapon={weapon}
        setWeapon={(weapon: Weapon | null) => setWeapon(weapon)}
        dropdownMode={isSmall}
      />
      <h1>{weapon}</h1>
    </>
  )
}

export default BuildsPage
