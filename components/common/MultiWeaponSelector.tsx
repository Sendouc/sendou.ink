import { Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";
import { useLingui } from "@lingui/react";
import WeaponImage from "./WeaponImage";
import WeaponSelector from "./WeaponSelector";

interface Props {
  name?: string;
  value: string[];
  onChange: (value: string[]) => void;
  isSalmonRun?: boolean;
}

const MultiWeaponSelector: React.FC<Props> = ({
  value,
  onChange,
  isSalmonRun,
}) => {
  const { i18n } = useLingui();

  return (
    <>
      {/* <Select
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
      </Select> */}
      <WeaponSelector
        value={undefined}
        setValue={(selectedWeapon) => {
          if (!!selectedWeapon && !value.includes(selectedWeapon))
            onChange(value.concat(selectedWeapon));
        }}
        pool={isSalmonRun ? "SALMON_RUN" : "WITH_ALTS"}
        isDisabled={
          (isSalmonRun && value.length === 4) ||
          (!isSalmonRun && value.length === 5)
        }
      />
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
