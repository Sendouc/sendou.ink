import { Label } from "~/components/Label";
import type { LFGFilter } from "../lfg-types";
import { Button } from "~/components/Button";
import { CrossIcon } from "~/components/icons/Cross";
import type { Tables } from "~/db/tables";
import { LFG } from "../lfg-constants";
import { useTranslation } from "react-i18next";
import { languagesUnified } from "~/modules/i18n/config";
import type { TierName } from "~/features/mmr/mmr-constants";
import { TIERS } from "~/features/mmr/mmr-constants";
import { capitalize } from "~/utils/strings";

export function LFGFilters({
  filters,
  changeFilter,
  removeFilterByTag,
}: {
  filters: LFGFilter[];
  changeFilter: (newFilter: LFGFilter) => void;
  removeFilterByTag: (tag: string) => void;
}) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="stack md">
      {filters.map((filter, i) => (
        <Filter
          key={filter._tag}
          filter={filter}
          nth={i + 1}
          changeFilter={changeFilter}
          removeFilter={() => removeFilterByTag(filter._tag)}
        />
      ))}
    </div>
  );
}

function Filter({
  filter,
  nth,
  changeFilter,
  removeFilter,
}: {
  filter: LFGFilter;
  nth: number;
  changeFilter: (newFilter: LFGFilter) => void;
  removeFilter: () => void;
}) {
  return (
    <div>
      <div className="stack horizontal justify-between">
        <Label>Filter {nth}</Label>
        <Button
          icon={<CrossIcon />}
          size="tiny"
          variant="minimal-destructive"
          onClick={removeFilter}
          aria-label="Delete filter"
        />
      </div>
      <div className="lfg__filter">
        {filter._tag === "Type" && (
          <TypeFilterFields value={filter.type} changeFilter={changeFilter} />
        )}
        {filter._tag === "Timezone" && (
          <TimezoneFilterFields
            value={filter.maxHourDifference}
            changeFilter={changeFilter}
          />
        )}
        {filter._tag === "Language" && (
          <LanguageFilterFields
            value={filter.language}
            changeFilter={changeFilter}
          />
        )}
        {filter._tag === "PlusTier" && (
          <PlusTierFilterFields
            value={filter.tier}
            changeFilter={changeFilter}
          />
        )}
        {filter._tag === "MaxTier" && (
          <TierFilterFields
            _tag="MaxTier"
            value={filter.tier}
            changeFilter={changeFilter}
          />
        )}
        {filter._tag === "MinTier" && (
          <TierFilterFields
            _tag="MinTier"
            value={filter.tier}
            changeFilter={changeFilter}
          />
        )}
      </div>
    </div>
  );
}

function TypeFilterFields({
  value,
  changeFilter,
}: {
  value: Tables["LFGPost"]["type"];
  changeFilter: (newFilter: LFGFilter) => void;
}) {
  const { t } = useTranslation(["lfg"]);

  return (
    <div>
      <Label>Type</Label>
      <select
        className="w-max"
        value={value}
        onChange={(e) =>
          changeFilter({
            _tag: "Type",
            type: e.target.value as Tables["LFGPost"]["type"],
          })
        }
      >
        {LFG.types.map((type) => (
          <option key={type} value={type}>
            {t(`lfg:types.${type}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

function TimezoneFilterFields({
  value,
  changeFilter,
}: {
  value: number;
  changeFilter: (newFilter: LFGFilter) => void;
}) {
  return (
    <div>
      <Label>Max hour difference</Label>
      <input
        type="number"
        value={value}
        min={0}
        max={12}
        onChange={(e) => {
          changeFilter({
            _tag: "Timezone",
            maxHourDifference: Number(e.target.value),
          });
        }}
      />
    </div>
  );
}

function LanguageFilterFields({
  value,
  changeFilter,
}: {
  value: string;
  changeFilter: (newFilter: LFGFilter) => void;
}) {
  return (
    <div>
      <Label>Language</Label>
      <select
        className="w-max"
        value={value}
        onChange={(e) =>
          changeFilter({
            _tag: "Language",
            language: e.target.value as Tables["LFGPost"]["type"],
          })
        }
      >
        {languagesUnified.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function PlusTierFilterFields({
  value,
  changeFilter,
}: {
  value: number;
  changeFilter: (newFilter: LFGFilter) => void;
}) {
  return (
    <div>
      <Label>Plus tier</Label>
      <select
        value={value}
        onChange={(e) =>
          changeFilter({ _tag: "PlusTier", tier: Number(e.target.value) })
        }
        className="w-max"
      >
        <option value="1">+1</option>
        <option value="2">+2 or above</option>
        <option value="3">+3 or above</option>
      </select>
    </div>
  );
}

function TierFilterFields({
  _tag,
  value,
  changeFilter,
}: {
  _tag: "MaxTier" | "MinTier";
  value: TierName;
  changeFilter: (newFilter: LFGFilter) => void;
}) {
  return (
    <div>
      <Label>Min tier</Label>
      <select
        value={value}
        onChange={(e) =>
          changeFilter({ _tag, tier: e.target.value as TierName })
        }
        className="w-max"
      >
        {TIERS.map((tier) => (
          <option key={tier.name} value={tier.name}>
            {capitalize(tier.name.toLowerCase())}
          </option>
        ))}
      </select>
    </div>
  );
}
