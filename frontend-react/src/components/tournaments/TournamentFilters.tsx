import {
  Box,
  Button,
  Collapse,
  Flex,
  Grid,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/core";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFilter } from "react-icons/fa";
import MyThemeContext from "../../themeContext";
import { Weapon } from "../../types";
import { maps } from "../../utils/lists";
import WeaponSelector from "../common/WeaponSelector";
import Input from "../elements/Input";
import Label from "../elements/Label";
import Select from "../elements/Select";

interface TournamentFiltersProps {
  forms: {
    tournament_name?: string;
    region?: string;
    player_name?: string;
    team_name?: string;
    comp?: string[];
    mode?: string;
    stage?: string;
  };
  handleChange: (value: Object) => void;
  handleClear: () => void;
  onSubmit: () => void;
}

const TournamentFilters: React.FC<TournamentFiltersProps> = ({
  forms,
  handleChange,
  handleClear,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { themeColor } = useContext(MyThemeContext);
  const [show, setShow] = useState(false);
  return (
    <>
      <Button leftIcon={<FaFilter />} onClick={() => setShow(!show)}>
        {show ? t("freeagents;Hide filters") : t("freeagents;Show filters")}
      </Button>
      <Collapse mt={4} isOpen={show}>
        <Grid maxW="500px" gridRowGap="1em" gridTemplateColumns="1fr">
          <Input
            label={t("tournaments;Tournament")}
            value={forms.tournament_name ?? ""}
            setValue={(value: string) =>
              handleChange({ tournament_name: value })
            }
          />
          <Input
            label={t("tournaments;Team")}
            value={forms.team_name ?? ""}
            setValue={(value: string) => handleChange({ team_name: value })}
          />
          <Input
            label={t("tournaments;Player")}
            value={forms.player_name ?? ""}
            setValue={(value: string) => handleChange({ player_name: value })}
          />
          <WeaponSelector
            label={t("tournaments;Comp")}
            value={(forms.comp as Weapon[]) ?? []}
            setValue={(value: Weapon[]) => handleChange({ comp: value })}
            isMulti
          />
          <Select
            label={t("tournaments;Map & mode")}
            isSearchable
            value={
              forms.stage && forms.mode ? `${forms.stage} (${forms.mode})` : ""
            }
            setValue={(value: string) => {
              const partsArray = value.split(" (");
              handleChange({
                stage: partsArray[0],
                mode: partsArray[1].substring(0, partsArray[1].length - 1),
              });
            }}
            options={maps.reduce(
              (acc: { label: string; value: string }[], cur: string) => [
                ...acc,
                {
                  label: `${t("game;" + cur)} - ${t("plans;turfWarShort")}`,
                  value: `${cur} (TW)`,
                },
                {
                  label: `${t("game;" + cur)} - ${t("plans;splatZonesShort")}`,
                  value: `${cur} (SZ)`,
                },
                {
                  label: `${t("game;" + cur)} - ${t(
                    "plans;towerControlShort"
                  )}`,
                  value: `${cur} (TC)`,
                },
                {
                  label: `${t("game;" + cur)} - ${t("plans;rainMakerShort")}`,
                  value: `${cur} (RM)`,
                },
                {
                  label: `${t("game;" + cur)} - ${t("plans;clamBlitzShort")}`,
                  value: `${cur} (CB)`,
                },
              ],
              []
            )}
          />
          <Box mt="0.5em">
            <Label>{t("tournaments;Region")}</Label>
            <RadioGroup
              value={forms.region ?? "all"}
              defaultValue="0"
              onChange={(value) => handleChange({ region: value })}
            >
              <Stack direction="row">
                <Radio colorScheme={themeColor} value="all">
                  {t("tournaments;All")}
                </Radio>
                <Radio colorScheme={themeColor} value="western">
                  {t("tournaments;Western")}
                </Radio>
                <Radio colorScheme={themeColor} value="jpn">
                  {t("tournaments;Japanese")}
                </Radio>
              </Stack>
            </RadioGroup>
          </Box>
          <Flex mt="1em">
            <Button onClick={onSubmit}>{t("tournaments;Apply")}</Button>
            <Box mx="1em">
              <Button variant="outline" onClick={handleClear}>
                {t("tournaments;Clear filters")}
              </Button>
            </Box>
          </Flex>
        </Grid>
      </Collapse>
    </>
  );
};

export default TournamentFilters;
