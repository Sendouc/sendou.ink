import { Box, Flex, HStack, StackProps } from "@chakra-ui/react";
import { useLingui } from "@lingui/react";
import { RankedMode } from "@prisma/client";
import ModeImage from "./ModeImage";
import SubText from "./SubText";

interface Props {
  mode: RankedMode;
  setMode: (mode: RankedMode) => void;
}

const ALL_MODES = ["SZ", "TC", "RM", "CB"] as const;

const ModeSelector: React.FC<Props & StackProps> = ({
  mode,
  setMode,
  ...props
}) => {
  const { i18n } = useLingui();

  return (
    <HStack my={4} {...props}>
      {ALL_MODES.map((modeInArr) => (
        <Flex key={modeInArr} flexDir="column" alignItems="center">
          <Box
            style={{
              filter: mode === modeInArr ? undefined : "grayscale(100%)",
            }}
            cursor="pointer"
            mb="-6px"
          >
            <ModeImage
              onClick={() => setMode(modeInArr)}
              mode={modeInArr}
              size={32}
            />
          </Box>
          {mode === modeInArr ? (
            <SubText>{i18n._(mode)}</SubText>
          ) : (
            <Box h={4} />
          )}
        </Flex>
      ))}
    </HStack>
  );
};

export default ModeSelector;
