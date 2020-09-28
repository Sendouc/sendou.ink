import { Box } from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Weapon } from "../../types"
import { weapons } from "../../utils/lists"
import PageHeader from "../common/PageHeader"
import Select from "../elements/Select"
import { PeakXPowerLeaderboard } from "./PeakXPowerLeaderboard"

const Leaderboard = ({ type }: { type: string }) => {
  switch (type) {
    case "PEAK_XP":
      return <PeakXPowerLeaderboard />
    default:
      return <PeakXPowerLeaderboard weapon={type as Weapon} />
  }
}

const selectOptions = [
  ...[
    {
      label: "X Power - All weapons",
      value: "PEAK_XP",
    },
  ],
  ...weapons.map((wpn) => ({ label: "X Power - " + wpn, value: wpn })),
] as const

const XLeaderboardsPage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation()
  const [value, setValue] = useState("PEAK_XP")
  return (
    <>
      <PageHeader title="X Leaderboards" />
      <Box>
        <Select
          options={selectOptions}
          value={
            weapons.includes(value as Weapon)
              ? t(`xsearch;X Power`) + " - " + t(`game;${value}`)
              : t(`xleaderboards;${value}`)
          }
          setValue={setValue}
          isSearchable
        />
      </Box>
      <Leaderboard type={value} />
    </>
  )
}

export default XLeaderboardsPage
