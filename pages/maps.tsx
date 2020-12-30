import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  FormLabel,
  Grid,
  Input,
  InputGroup,
  InputRightElement,
  Textarea,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { RankedMode } from "@prisma/client";
import Breadcrumbs from "components/common/Breadcrumbs";
import ModeImage from "components/common/ModeImage";
import MyContainer from "components/common/MyContainer";
import SubText from "components/common/SubText";
import { stages } from "lib/lists/stages";
import { useRouter } from "next/router";
import { ChangeEvent, Fragment, useState } from "react";

const MapsGeneratorPage = () => {
  const router = useRouter();
  const { i18n } = useLingui();
  const [stagesSelected, setStagesSelected] = useState<
    Record<string, RankedMode[]>
  >(getInitialStages());
  const [maplist, setMaplist] = useState("");
  const [count, setCount] = useState(9);

  function getInitialStages() {
    return Object.entries(router.query).reduce(
      (acc: Record<string, RankedMode[]>, cur) => {
        if (stages.includes(cur[0]) && typeof cur[1] === "string") {
          // @ts-ignore
          acc[cur[0]] = cur[1]
            .split(",")
            .filter((mode) => ["SZ", "TC", "RM", "CB"].includes(mode));
        }
        return acc;
      },
      {}
    );
  }

  const poolForUrl = (stagesSelectedForUrl: Record<string, string[]>) => {
    return Object.entries(stagesSelectedForUrl).reduce(
      (acc: Record<string, string>, cur) => {
        if (cur[1].length) acc[cur[0]] = cur[1].join(",");

        return acc;
      },
      {}
    );
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    mode: RankedMode,
    stage: string
  ) => {
    const oldArray = stagesSelected[stage] ?? [];
    const newArray = e.target.checked
      ? oldArray.concat(mode)
      : oldArray.filter((modeInArray) => modeInArray !== mode);

    const newStagesSelected = { ...stagesSelected, [stage]: newArray };

    setStagesSelected(newStagesSelected);
    router.replace({
      pathname: "/maps",
      query: poolForUrl(newStagesSelected),
    });
  };

  const shuffled = (array: string[]) => {
    return array
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  };

  const generateMaps = () => {
    let modeStages = Object.entries(stagesSelected).reduce(
      (acc: Record<RankedMode, string[]>, [stage, modes]) => {
        modes.forEach((mode) => acc[mode].push(stage));
        return acc;
      },
      { SZ: [], TC: [], RM: [], CB: [] }
    );

    modeStages = {
      SZ: shuffled(modeStages.SZ),
      TC: shuffled(modeStages.TC),
      RM: shuffled(modeStages.RM),
      CB: shuffled(modeStages.CB),
    };

    const modes = (shuffled(["SZ", "TC", "RM", "CB"]) as RankedMode[]).filter(
      (mode) => modeStages[mode].length > 0
    );
    if (modes.length === 0) {
      return "I can't generate a maplist without any maps in it you know.";
    }

    const stagesAlreadyPicked = new Set<string>();

    return new Array(count)
      .fill(null)
      .map((_, i) => {
        modes.push(modes.shift() as RankedMode);
        const stageArray = modeStages[modes[0]];

        stageArray.push(stageArray.shift() as string);

        let shifted = 0;
        while (
          stagesAlreadyPicked.has(stageArray[0]) ||
          shifted >= stageArray.length
        ) {
          stageArray.push(stageArray.shift() as string);
          shifted++;
        }

        stagesAlreadyPicked.add(stageArray[0]);

        return `${i + 1}) ${modes[0]} on ${stageArray[0]}`;
      })
      .join("\n");
  };

  return (
    <MyContainer>
      <Breadcrumbs pages={[{ name: "Maps" }]} />
      <Alert status="info" mb={8}>
        <AlertIcon />
        <Trans>
          Pro tip: bookmark this page after making your map list to save it
        </Trans>
      </Alert>
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
          <Fragment key={stage}>
            <SubText textAlign="center">{i18n._(stage)}</SubText>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newStagesSelected = {
                  ...stagesSelected,
                  [stage]: ["SZ", "TC", "RM", "CB"] as RankedMode[],
                };

                setStagesSelected(newStagesSelected);

                router.replace({
                  pathname: "/maps",
                  query: poolForUrl(newStagesSelected),
                });
              }}
            >
              <Trans>All</Trans>
            </Button>
            <Checkbox
              value="SZ"
              isChecked={(stagesSelected[stage] ?? []).includes("SZ")}
              onChange={(e) => handleChange(e, "SZ", stage)}
            />
            <Checkbox
              value="TC"
              isChecked={(stagesSelected[stage] ?? []).includes("TC")}
              onChange={(e) => handleChange(e, "TC", stage)}
            />
            <Checkbox
              value="RM"
              isChecked={(stagesSelected[stage] ?? []).includes("RM")}
              onChange={(e) => handleChange(e, "RM", stage)}
            />
            <Checkbox
              value="CB"
              isChecked={(stagesSelected[stage] ?? []).includes("CB")}
              onChange={(e) => handleChange(e, "CB", stage)}
            />
          </Fragment>
        ))}
      </Grid>
      <FormLabel htmlFor="share" mt={4}>
        <Trans>Share your map pool</Trans>
      </FormLabel>
      {window && (
        <InputGroup size="md">
          <Input name="share" value={window.location.href} readOnly />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm">
              <Trans>Copy</Trans>
            </Button>
          </InputRightElement>
        </InputGroup>
      )}
      <Button
        mt={8}
        mb={4}
        size="lg"
        onClick={() => setMaplist(generateMaps())}
      >
        <Trans>Generate maps</Trans>
      </Button>
      {maplist && <Textarea value={maplist} readOnly rows={count} />}
    </MyContainer>
  );
};

export default MapsGeneratorPage;
