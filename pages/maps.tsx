import { Box, Button, Checkbox, CheckboxGroup, Grid } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import Breadcrumbs from "components/common/Breadcrumbs";
import ModeImage from "components/common/ModeImage";
import MyContainer from "components/common/MyContainer";
import SubText from "components/common/SubText";
import { stages } from "lib/lists/stages";
import { useState } from "react";

const MapsGeneratorPage = ({}) => {
  const { i18n } = useLingui();
  const [stagesSelected, setStagesSelected] = useState<
    Record<string, string[]>
  >({});

  console.log({ stagesSelected });

  return (
    <MyContainer>
      <Breadcrumbs pages={[{ name: "Maps" }]} />
      <Grid templateColumns="repeat(6, 1fr)" rowGap={4} placeItems="center">
        <Box />
        <Box />
        <SubText>
          <ModeImage mode="SZ" />
        </SubText>
        <SubText>
          <ModeImage mode="TC" />
        </SubText>
        <SubText>
          <ModeImage mode="RM" />
        </SubText>
        <SubText>
          <ModeImage mode="CB" />
        </SubText>
        {stages.map((stage) => (
          <>
            <SubText textAlign="center">{i18n._(stage)}</SubText>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setStagesSelected({
                  ...stagesSelected,
                  [stage]: ["SZ", "TC", "RM", "CB"],
                })
              }
            >
              <Trans>All</Trans>
            </Button>
            <CheckboxGroup
              onChange={(value: string[]) =>
                setStagesSelected({ ...stagesSelected, [stage]: value })
              }
            >
              <Checkbox
                value="SZ"
                isChecked={(stagesSelected[stage] ?? []).includes("SZ")}
              />
              <Checkbox
                value="TC"
                isChecked={(stagesSelected[stage] ?? []).includes("TC")}
              />
              <Checkbox
                value="RM"
                isChecked={(stagesSelected[stage] ?? []).includes("RM")}
              />
              <Checkbox
                value="CB"
                isChecked={(stagesSelected[stage] ?? []).includes("CB")}
              />
            </CheckboxGroup>
          </>
        ))}
      </Grid>
    </MyContainer>
  );
};

export default MapsGeneratorPage;
