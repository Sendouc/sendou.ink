import { Select, Tag, TagCloseButton, TagLabel } from "@chakra-ui/core";
import { weaponsWithHeroCategorized } from "lib/lists/weaponsWithHero";
import WeaponImage from "./WeaponImage";

interface Props {
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
}

const WeaponSelector: React.FC<Props> = ({ name, value, onChange }) => {
  return (
    <>
      <Select
        name={name}
        onChange={(e) => onChange(value.concat(e.target.value))}
      >
        {weaponsWithHeroCategorized.map((wpnCategory) => (
          <optgroup key={wpnCategory.name} label={wpnCategory.name}>
            {wpnCategory.weapons.map((wpn) => (
              <option key={wpn} value={wpn}>
                {wpn}
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
            <WeaponImage englishName={wpn} size="SMALL" />
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

export default WeaponSelector;
