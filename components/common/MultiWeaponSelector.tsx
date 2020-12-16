import { Select, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { salmonRunWeapons, weaponsWithHero } from "lib/lists/weaponsWithHero";
import WeaponImage from "./WeaponImage";

interface Props {
  name?: string;
  value: string[];
  onChange: (value: string[]) => void;
  isSalmonRun?: boolean;
}

const MultiWeaponSelector: React.FC<Props> = ({
  name,
  value,
  onChange,
  isSalmonRun,
}) => {
  const { i18n } = useLingui();

  const weaponsArray: readonly string[] = isSalmonRun
    ? salmonRunWeapons
    : weaponsWithHero;
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
        {isSalmonRun && (
          <>
            <option value="RANDOM">{t`Random`}</option>
            <option value="RANDOM_GRIZZCO">{t`Random (Grizzco)`}</option>
          </>
        )}
        {weaponsArray.map((wpn) => (
          <option key={wpn} value={wpn}>
            {i18n._(wpn)}
          </option>
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
