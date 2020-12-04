import { Select, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { weaponsWithHeroCategorized } from "lib/lists/weaponsWithHero";
import WeaponImage from "./WeaponImage";

interface Props {
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
}

const MultiWeaponSelector: React.FC<Props> = ({ name, value, onChange }) => {
  const { i18n } = useLingui();
  return (
    <>
      <Select
        name={name}
        onChange={(e) => {
          if (!!e.target.value && !value.includes(e.target.value))
            onChange(value.concat(e.target.value));
        }}
        value=""
        disabled={value.length === 5}
      >
        <option hidden value="">
          {t`Select weapon`}
        </option>
        {weaponsWithHeroCategorized.map((wpnCategory) => (
          <optgroup key={wpnCategory.name} label={i18n._(wpnCategory.name)}>
            {wpnCategory.weapons.map((wpn) => (
              <option key={wpn} value={wpn}>
                {i18n._(wpn)}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
      {value.map((wpn) => (
        <Tag
          size="small"
          key={wpn}
          borderRadius="full"
          variant="outline"
          p={1}
          m={2}
        >
          <TagLabel>
            <WeaponImage name={wpn} size={32} />
          </TagLabel>
          <TagCloseButton
            borderRadius="full"
            onClick={() =>
              onChange(value.filter((wpnSelected) => wpnSelected !== wpn))
            }
          />
        </Tag>
      ))}
    </>
  );
};

export default MultiWeaponSelector;
