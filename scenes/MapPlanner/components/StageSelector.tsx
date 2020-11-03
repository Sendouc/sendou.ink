import { Box, HStack, Image, Radio, RadioGroup, Select } from "@chakra-ui/core";
import salmonRunHighTide from "assets/SalmonRunHighTide.svg";
import salmonRunLowTide from "assets/SalmonRunLowTide.svg";
import salmonRunMidTide from "assets/SalmonRunMidTide.svg";
import ModeImage from "lib/components/ModeImage";
import { stages } from "lib/lists/stages";
import { PlannerMapBg } from "..";

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
  return (
    <Box maxW="20rem" m="3rem auto">
      <Select value={currentBackground.stage} onChange={handleChange}>
        <option value="Spawning Grounds">Spawning Grounds</option>
        <option value="Marooner's Bay">Marooner's Bay</option>
        <option value="Lost Outpost">Lost Outpost</option>
        <option value="Salmonid Smokeyard">Salmonid Smokeyard</option>
        <option value="Ruins of Ark Polaris">Ruins of Ark Polaris‎‎</option>
        {stages.map((stage) => (
          <option key={stage} value={stage}>
            {stage}
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
            {(["SZ", "TC", "RM", "CB"] as const).map((mode) => (
              <ModeImage
                key={mode}
                onClick={() => changeMode(mode)}
                mode={mode}
                w={8}
                h={8}
                cursor="pointer"
                style={{
                  filter:
                    currentBackground.mode === mode
                      ? undefined
                      : "grayscale(100%)",
                }}
              />
            ))}
          </HStack>
          <RadioGroup value={currentBackground.view} onChange={changeView}>
            <HStack justifyContent="center" spacing={6}>
              <Radio size="sm" value="M">
                Minimap
              </Radio>
              <Radio size="sm" value="R">
                Top-down
              </Radio>
            </HStack>
          </RadioGroup>
        </>
      )}
    </Box>
  );
};

export default StageSelector;
