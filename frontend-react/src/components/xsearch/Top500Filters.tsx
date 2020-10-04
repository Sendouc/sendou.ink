import { Box, Radio, RadioGroup, Stack } from "@chakra-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GetXRankPlacementsInput, RankedMode } from "../../generated/graphql";
import MyThemeContext from "../../themeContext";
import { getLocalizedMonthYearString } from "../../utils/helperFunctions";
import { months } from "../../utils/lists";
import Button from "../elements/Button";
import Input from "../elements/Input";
import Label from "../elements/Label";
import Select from "../elements/Select";

interface Top500FilterProps {
  filter: GetXRankPlacementsInput;
  handleChange: (value: GetXRankPlacementsInput) => void;
}

const Top500Filters: React.FC<Top500FilterProps> = ({
  filter,
  handleChange,
}) => {
  const { t, i18n } = useTranslation();
  const { themeColor } = useContext(MyThemeContext);

  const [name, setName] = useState("");

  useEffect(() => {
    if (name === filter.name) return;

    const timer = setTimeout(() => {
      handleChange({ name: name || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [name, filter.name, handleChange]);

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
      <Input value={name} setValue={setName} label={t("xsearch;Name")} />
      <Box my={3}>
        <Select
          value={
            filter.month && filter.year
              ? {
                  value: `${months[filter.month]} ${filter.year}`,
                  label: getLocalizedMonthYearString(
                    filter.month,
                    filter.year,
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
          value={"" + filter.mode}
          defaultValue="0"
          onChange={(value) => handleChange({ mode: value as RankedMode })}
        >
          <Stack direction="row">
            <Radio colorScheme={themeColor} value="SZ">
              {t("plans;splatZonesShort")}
            </Radio>
            <Radio colorScheme={themeColor} value="TC">
              {t("plans;towerControlShort")}
            </Radio>
            <Radio colorScheme={themeColor} value="RM">
              {t("plans;rainMakerShort")}
            </Radio>
            <Radio colorScheme={themeColor} value="CB">
              {t("plans;clamBlitzShort")}
            </Radio>
          </Stack>
        </RadioGroup>
        <Button
          onClick={() =>
            handleChange({
              mode: undefined,
              name: undefined,
              month: undefined,
              year: undefined,
            })
          }
          my={6}
          outlined
        >
          {t("tournaments;Clear filters")}
        </Button>
      </Box>
    </Box>
  );
};

export default Top500Filters;
