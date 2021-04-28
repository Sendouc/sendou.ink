import { Radio, RadioGroup, RadioGroupProps, Stack } from "@chakra-ui/react";
import { RankedMode } from "@prisma/client";
import ModeImage from "components/common/ModeImage";

interface Props {
  mode: RankedMode;
  setMode: (mode: RankedMode) => void;
}

const ModeSelector = ({
  mode,
  setMode,
  ...props
}: Props & Omit<RadioGroupProps, "children">) => {
  return (
    <RadioGroup
      value={mode}
      onChange={(value) => setMode(value as RankedMode)}
      {...props}
    >
      <Stack direction="row" spacing={4} align="center">
        <Radio value="SZ">
          <ModeImage mode="SZ" size={32} />
        </Radio>
        <Radio value="TC">
          <ModeImage mode="TC" size={32} />
        </Radio>
        <Radio value="RM">
          <ModeImage mode="RM" size={32} />
        </Radio>
        <Radio value="CB">
          <ModeImage mode="CB" size={32} />
        </Radio>
      </Stack>
    </RadioGroup>
  );
};

export default ModeSelector;
