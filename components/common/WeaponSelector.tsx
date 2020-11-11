import { Select } from "@chakra-ui/core";
import { useLingui } from "@lingui/react";
import { weaponsWithHeroCategorizedLocalized } from "lib/lists/weaponsWithHero";

interface Props {
  name?: string;
  value: string;
  excludeAlt?: boolean;
  onChange: (value: string) => void;
}

const WeaponSelector: React.FC<Props> = ({
  name,
  value,
  onChange,
  excludeAlt,
}) => {
  const { i18n } = useLingui();
  return (
    <>
      <Select
        value={value}
        name={name}
        onChange={(e) => onChange(e.target.value)}
      >
        {weaponsWithHeroCategorizedLocalized.map((wpnCategory) => (
          <optgroup key={wpnCategory.name} label={i18n._(wpnCategory.name)}>
            {wpnCategory.weapons.map((wpn) => {
              if (
                (excludeAlt && wpn.includes("Hero")) ||
                wpn.includes("Octo Shot")
              )
                return null;
              return (
                <option key={wpn} value={wpn}>
                  {i18n._(wpn)}
                </option>
              );
            })}
          </optgroup>
        ))}
      </Select>
    </>
  );
};

export default WeaponSelector;
