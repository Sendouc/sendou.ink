import { Box } from "@chakra-ui/core";
import { RouteComponentProps } from "@reach/router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { XRankLeaderboardType } from "../../generated/graphql";
import { Weapon } from "../../types";
import { weapons } from "../../utils/lists";
import PageHeader from "../common/PageHeader";
import Select from "../elements/Select";
import { PeakXPowerLeaderboard } from "./PeakXPowerLeaderboard";
import XRankScoreLeaderboard from "./XRankScoreLeaderboard";

const Leaderboard = ({ type }: { type: string }) => {
  switch (type) {
    case "PEAK_XP":
      return <PeakXPowerLeaderboard />;
    case "PLACEMENTS_COUNT":
    case "UNIQUE_WEAPONS_COUNT":
    case "FOUR_MODE_PEAK_AVERAGE":
      return <XRankScoreLeaderboard type={type as XRankLeaderboardType} />;
    default:
      return <PeakXPowerLeaderboard weapon={type as Weapon} />;
  }
};

const selectOptions = [
  ...[
    {
      label: "X Power - All weapons",
      value: "PEAK_XP",
    },
    {
      label: "Top 500 placements",
      value: "PLACEMENTS_COUNT",
    },
    {
      label: "Top 500 placements with different weapons",
      value: "UNIQUE_WEAPONS_COUNT",
    },
    {
      label: "4 mode peak X Power average",
      value: "FOUR_MODE_PEAK_AVERAGE",
    },
  ],
  ...weapons
    .filter((wpn) => !wpn.includes("Hero"))
    .map((wpn) => ({ label: "X Power - " + wpn, value: wpn })),
] as const;

const XLeaderboardsPage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState("PEAK_XP");
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
  );
};

export default XLeaderboardsPage;
