import { Button } from "~/components/Button";
import { Menu } from "~/components/Menu";
import * as React from "react";
import { FilterIcon } from "~/components/icons/Filter";
import type { LFGFilter } from "../lfg-types";
import { t } from "i18next";

const FilterMenuButton = React.forwardRef(function (props, ref) {
  return (
    <Button
      variant="outlined"
      size="tiny"
      icon={<FilterIcon />}
      // disabled={filters.length >= MAX_BUILD_FILTERS}
      testId="add-filter-button"
      {...props}
      _ref={ref}
    >
      Add filter
    </Button>
  );
});

const items: Record<
  LFGFilter["_tag"],
  {
    text: string;
    defaultFilter: LFGFilter;
  }
> = {
  Weapon: {
    text: "Weapon",
    defaultFilter: { _tag: "Weapon", weaponSplId: 0 },
  },
  Type: {
    text: "Type",
    defaultFilter: { _tag: "Type", type: "PLAYER_FOR_TEAM" },
  },
  Language: {
    text: "Language",
    defaultFilter: { _tag: "Language", language: "EN" },
  },
  PlusTier: {
    text: "Plus tier",
    defaultFilter: { _tag: "PlusTier", tier: 3 },
  },
  Timezone: {
    text: "Timezone",
    defaultFilter: { _tag: "Timezone", maxHourDifference: 3 },
  },
  MinTier: {
    text: "Min tier",
    defaultFilter: { _tag: "MinTier", tier: "GOLD" },
  },
  MaxTier: {
    text: "Max tier",
    defaultFilter: { _tag: "MaxTier", tier: "PLATINUM" },
  },
};

// xxx: filter those that are already in filters
export function LFGAddFilterButton({
  addFilter,
}: {
  addFilter: (filter: LFGFilter) => void;
}) {
  return (
    <Menu
      items={Object.entries(items).map(([tag, item]) => ({
        id: tag,
        text: t(item.text),
        onClick: () => addFilter(item.defaultFilter),
      }))}
      button={FilterMenuButton}
    />
  );
}
