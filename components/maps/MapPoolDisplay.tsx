import { RankedMode } from "@prisma/client";
import { Box, Grid, useMediaQuery } from "@chakra-ui/react";
import ModeImage from "../common/ModeImage";
import SubText from "../common/SubText";
import { t } from "@lingui/macro";
import { FaCheck } from "react-icons/fa";
import { CSSVariables } from "../../utils/CSSVariables";
import NewTable from "../common/NewTable";

export function MapPoolDisplay({
  stagesSelected,
}: {
  stagesSelected: Record<string, RankedMode[]>;
}) {
  const [isMobile] = useMediaQuery("(max-width: 48em)");

  return isMobile ? (
    <Grid
      mb={8}
      templateColumns="repeat(4, 1fr)"
      rowGap={4}
      columnGap={4}
      display="grid"
    >
      <Box textAlign="center">
        <ModeImage mode="SZ" />
      </Box>
      <Box textAlign="center">
        <ModeImage mode="TC" />
      </Box>
      <Box textAlign="center">
        <ModeImage mode="RM" />
      </Box>
      <Box textAlign="center">
        <ModeImage mode="CB" />
      </Box>
      <Box textAlign="center">
        {Object.entries(stagesSelected).map(([stage, modes]) =>
          modes.includes("SZ") ? (
            <SubText key={stage}>{t({ id: stage })}</SubText>
          ) : null
        )}
      </Box>
      <Box textAlign="center">
        {Object.entries(stagesSelected).map(([stage, modes]) =>
          modes.includes("TC") ? (
            <SubText key={stage}>{t({ id: stage })}</SubText>
          ) : null
        )}
      </Box>
      <Box textAlign="center">
        {Object.entries(stagesSelected).map(([stage, modes]) =>
          modes.includes("RM") ? (
            <SubText key={stage}>{t({ id: stage })}</SubText>
          ) : null
        )}
      </Box>
      <Box textAlign="center">
        {Object.entries(stagesSelected).map(([stage, modes]) =>
          modes.includes("CB") ? (
            <SubText key={stage}>{t({ id: stage })}</SubText>
          ) : null
        )}
      </Box>
    </Grid>
  ) : (
    <NewTable
      size="sm"
      headers={[
        { name: t`Stage name`, dataKey: "stage" },
        { name: t`Splat Zones`, dataKey: RankedMode.SZ },
        { name: t`Tower Control`, dataKey: RankedMode.TC },
        { name: t`Rainmaker`, dataKey: RankedMode.RM },
        { name: t`Clam Blitz`, dataKey: RankedMode.CB },
      ]}
      data={Object.entries(stagesSelected).map(([stage, modes], index) =>
        modes.length > 0
          ? {
              id: index,
              stage: t({ id: stage }),
              ...Object.values(RankedMode).reduce((map, mode) => {
                map[mode] = modes.includes(mode) ? (
                  <FaCheck
                    color={CSSVariables.themeColor}
                    style={{ margin: "auto" }}
                  />
                ) : null;
                return map;
              }, {} as { [mode in RankedMode]: JSX.Element | null }),
            }
          : null
      )}
    />
  );
}
