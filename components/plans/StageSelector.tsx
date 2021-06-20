import { Box, Flex, HStack, Radio, RadioGroup, Select } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { RankedMode } from "@prisma/client";
import ModeSelector from "components/common/ModeSelector";
import SubText from "components/common/SubText";
import { PlannerMapBg } from "pages/plans";
import NextImage from "next/image";
import salmonRunHighTide from "utils/assets/SalmonRunHighTide.svg";
import salmonRunLowTide from "utils/assets/SalmonRunLowTide.svg";
import salmonRunMidTide from "utils/assets/SalmonRunMidTide.svg";
import { salmonRunStages, stages } from "utils/lists/stages";
import styles from "./StageSelector.module.css";

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
    <Box maxW="20rem" m="0 auto 2rem auto">
      <Select value={currentBackground.stage} onChange={handleChange}>
        {salmonRunStages
          .concat(stages)
          .sort((a, b) => a.localeCompare(b))
          .concat(["Blank"])
          .map((stage) => (
            <option key={stage} value={stage}>
              {i18n._(stage)}
            </option>
          ))}
      </Select>
      {!currentBackground.tide &&
      !currentBackground.mode ? null : currentBackground.tide ? (
        <>
          <HStack my={4} display="flex" justifyContent="center">
            <Flex flexDir="column" alignItems="center">
              <NextImage
                className={styles["sr-icon"]}
                width={32}
                height={32}
                src={salmonRunLowTide}
                alt="Salmon Run low tide"
                onClick={() => changeTide("low")}
              />
              {currentBackground.tide === "low" ? (
                <SubText>
                  <Trans>Low</Trans>
                </SubText>
              ) : (
                <Box h={4} />
              )}
            </Flex>
            <Flex flexDir="column" alignItems="center">
              <NextImage
                className={styles["sr-icon"]}
                width={32}
                height={32}
                src={salmonRunMidTide}
                alt="Salmon Run mid-tide"
                onClick={() => changeTide("mid")}
              />
              {currentBackground.tide === "mid" ? (
                <SubText>
                  <Trans>Mid</Trans>
                </SubText>
              ) : (
                <Box h={4} />
              )}
            </Flex>
            <Flex flexDir="column" alignItems="center">
              <NextImage
                className={styles["sr-icon"]}
                width={32}
                height={32}
                src={salmonRunHighTide}
                alt="Salmon Run high tide"
                onClick={() => changeTide("high")}
              />
              {currentBackground.tide === "high" ? (
                <SubText>
                  <Trans>High</Trans>
                </SubText>
              ) : (
                <Box h={4} />
              )}
            </Flex>
          </HStack>
        </>
      ) : (
        <>
          <ModeSelector
            mode={currentBackground.mode as RankedMode}
            setMode={changeMode}
            mt={2}
            display="flex"
            justifyContent="center"
          />
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
