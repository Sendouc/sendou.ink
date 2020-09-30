import React, { useContext } from "react";
import Input from "../elements/Input";
import WeaponSelector from "../common/WeaponSelector";
import { Box, RadioGroup, Radio, Stack } from "@chakra-ui/core";
import MyThemeContext from "../../themeContext";
import { months } from "../../utils/lists";
import Select from "../elements/Select";
import Label from "../elements/Label";
import { Weapon } from "../../types";
import { useTranslation } from "react-i18next";
import { getLocalizedMonthYearString } from "../../utils/helperFunctions";

interface Top500FormsProps {
  forms: {
    name?: string;
    weapon?: string;
    mode?: number;
    month?: number;
    year?: number;
  };
  handleChange: (value: Object) => void;
}

const Top500Forms: React.FC<Top500FormsProps> = ({ forms, handleChange }) => {
  const { t, i18n } = useTranslation();
  const { themeColor } = useContext(MyThemeContext);

  const monthChoices = [];
  let month = 5;
  let year = 2018;
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();
  while (true) {
    if (month === currentMonth && year === currentYear) break;
    const monthString = getLocalizedMonthYearString(month, year, i18n.language);
    monthChoices.push({ label: monthString, value: `${month},${year}` });

    month++;
    if (month === 13) {
      month = 1;
      year++;
    }
  }

  monthChoices.reverse();

  return (
    <Box maxW="500px">
      <Input
        value={forms.name ?? ""}
        setValue={(value: string) => handleChange({ name: value })}
        label={t("xsearch;Name")}
      />
      <Box mt="0.5em">
        <WeaponSelector
          label={t("freeagents;Weapon")}
          value={(forms.weapon as Weapon) ?? null}
          setValue={(value: string) => handleChange({ weapon: value })}
          clearable
        />
      </Box>
      <Box mt="0.5em">
        <Select
          value={
            forms.month && forms.year
              ? {
                  value: `${months[forms.month]} ${forms.year}`,
                  label: getLocalizedMonthYearString(
                    forms.month,
                    forms.year,
                    i18n.language
                  ),
                }
              : ""
          }
          options={monthChoices}
          label={t("xsearch;Month")}
          setValue={(value: any) => {
            const monthParts = value.split(",");
            const month = parseInt(monthParts[0]);
            const year = parseInt(monthParts[1]);
            handleChange({ month, year });
          }}
          width="100%"
        />
      </Box>
      <Box mt="0.5em">
        <Label>{t("xsearch;Mode")}</Label>
        <RadioGroup
          value={"" + forms.mode}
          defaultValue="0"
          onChange={(value) => handleChange({ mode: parseInt(value as any) })}
        >
          <Stack direction="row">
            <Radio colorScheme={themeColor} value="0">
              {t("xsearch;All modes")}
            </Radio>
            <Radio colorScheme={themeColor} value="1">
              {t("plans;splatZonesShort")}
            </Radio>
            <Radio colorScheme={themeColor} value="2">
              {t("plans;towerControlShort")}
            </Radio>
            <Radio colorScheme={themeColor} value="3">
              {t("plans;rainMakerShort")}
            </Radio>
            <Radio colorScheme={themeColor} value="4">
              {t("plans;clamBlitzShort")}
            </Radio>
          </Stack>
        </RadioGroup>
      </Box>
    </Box>
  );
};

export default Top500Forms;
