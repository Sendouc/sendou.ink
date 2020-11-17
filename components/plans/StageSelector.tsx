import {
  Box,
  HStack,
  Image,
  Radio,
  RadioGroup,
  Select,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import ModeImage from "components/common/ModeImage";
import salmonRunHighTide from "lib/assets/SalmonRunHighTide.svg";
import salmonRunLowTide from "lib/assets/SalmonRunLowTide.svg";
import salmonRunMidTide from "lib/assets/SalmonRunMidTide.svg";
import { stages } from "lib/lists/stages";
import { PlannerMapBg } from ".";

interface StageSelectorProps {
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  currentBackground: PlannerMapBg;
  changeMode: (mode: "SZ" | "TC" | "RM" | "CB") => void;
  changeTide: (tide: "low" | "mid" | "high") => void;
  changeView: (view: "M" | "R") => void;
}

const StageSelector: React.FC<StageSelectorProps> = ({
  handleChange,
  currentBackground,
  changeMode,
  changeTide,
  changeView,
}) => {
  const { i18n } = useLingui();
  return (
    <Box maxW="20rem" m="3rem auto">
      <Select value={currentBackground.stage} onChange={handleChange}>
        <option value="Spawning Grounds">{i18n._(t`Spawning Grounds`)}</option>
        <option value="Marooner's Bay">{i18n._(t`Marooner's Bay`)}</option>
        <option value="Lost Outpost">{i18n._(t`Lost Outpost`)}</option>
        <option value="Salmonid Smokeyard">
          {i18n._(t`Salmonid Smokeyard`)}
        </option>
        <option value="Ruins of Ark Polaris">
          {i18n._(t`Ruins of Ark Polaris‎‎`)}
        </option>
        {stages.map((stage) => (
          <option key={stage} value={stage}>
            {i18n._(stage)}
          </option>
        ))}
      </Select>
      {currentBackground.tide ? (
        <>
          <HStack my={4} display="flex" justifyContent="center">
            <Image
              w={8}
              h={8}
              src={salmonRunLowTide}
              cursor="pointer"
              style={{
                filter:
                  currentBackground.tide === "low"
                    ? undefined
                    : "grayscale(100%)",
              }}
              onClick={() => changeTide("low")}
            />
            <Image
              w={8}
              h={8}
              src={salmonRunMidTide}
              cursor="pointer"
              style={{
                filter:
                  currentBackground.tide === "mid"
                    ? undefined
                    : "grayscale(100%)",
              }}
              onClick={() => changeTide("mid")}
            />
            <Image
              w={8}
              h={8}
              src={salmonRunHighTide}
              cursor="pointer"
              style={{
                filter:
                  currentBackground.tide === "high"
                    ? undefined
                    : "grayscale(100%)",
              }}
              onClick={() => changeTide("high")}
            />
          </HStack>
        </>
      ) : (
        <>
          <HStack justifyContent="center" my={4}>
            {/* FIXME: actual radio button component for Top500 page too */}
            {(["SZ", "TC", "RM", "CB"] as const).map((mode) => (
              <ModeImage
                key={mode}
                onClick={() => changeMode(mode)}
                mode={mode}
                size={32}
              />
            ))}
          </HStack>
          <RadioGroup value={currentBackground.view} onChange={changeView}>
            <HStack justifyContent="center" spacing={6}>
              <Radio size="sm" value="M">
                <Trans>Minimap</Trans>
              </Radio>
              <Radio size="sm" value="R">
                <Trans>Top-down</Trans>
              </Radio>
            </HStack>
          </RadioGroup>
        </>
      )}
    </Box>
  );
};

export default StageSelector;
