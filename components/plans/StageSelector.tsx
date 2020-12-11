import {
  Box,
  Flex,
  HStack,
  Image,
  Radio,
  RadioGroup,
  Select,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { RankedMode } from "@prisma/client";
import ModeSelector from "components/common/ModeSelector";
import SubText from "components/common/SubText";
// @ts-ignore
import salmonRunHighTide from "lib/assets/SalmonRunHighTide.svg";
// @ts-ignore
import salmonRunLowTide from "lib/assets/SalmonRunLowTide.svg";
// @ts-ignore
import salmonRunMidTide from "lib/assets/SalmonRunMidTide.svg";
import { salmonRunStages, stages } from "lib/lists/stages";
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
        {salmonRunStages.concat(stages).map((stage) => (
          <option key={stage} value={stage}>
            {i18n._(stage)}
          </option>
        ))}
      </Select>
      {currentBackground.tide ? (
        <>
          <HStack my={4} display="flex" justifyContent="center">
            <Flex flexDir="column" alignItems="center">
              <Image
                w={8}
                h={8}
                mb={1}
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
              {currentBackground.tide === "low" ? (
                <SubText>
                  <Trans>Low</Trans>
                </SubText>
              ) : (
                <Box h={4} />
              )}
            </Flex>
            <Flex flexDir="column" alignItems="center">
              <Image
                w={8}
                h={8}
                mb={1}
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
              {currentBackground.tide === "mid" ? (
                <SubText>
                  <Trans>Mid</Trans>
                </SubText>
              ) : (
                <Box h={4} />
              )}
            </Flex>
            <Flex flexDir="column" alignItems="center">
              <Image
                w={8}
                h={8}
                mb={1}
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
            justify="center"
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
