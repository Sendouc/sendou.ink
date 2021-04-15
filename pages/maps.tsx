import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Grid,
  Input,
  InputGroup,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { RankedMode } from "@prisma/client";
import ModeImage from "components/common/ModeImage";
import SubText from "components/common/SubText";
import HeaderBanner from "components/layout/HeaderBanner";
import MultipleModeSelector from "components/common/MultipleModeSelector";
import { useRouter } from "next/router";
import { ChangeEvent, Fragment, useEffect, useState } from "react";
import { FiCheck, FiFilter, FiRotateCw } from "react-icons/fi";
import { shuffleArray } from "utils/arrays";
import { stages } from "utils/lists/stages";
import { setManySearchParams } from "utils/setSearchParams";
import MyHead from "../components/common/MyHead";

const MapsGeneratorPage = () => {
  const router = useRouter();
  const { i18n } = useLingui();

  const [stagesSelected, setStagesSelected] = useState<
    Record<string, RankedMode[]>
  >(getInitialStages());
  const [generationMode, setGenerationMode] = useState<
    "EQUAL" | "SZ_EVERY_OTHER" | "CUSTOM_ORDER"
  >("EQUAL");
  const [maplist, setMaplist] = useState("");
  const [modes, setModes] = useState<
    { label: string; value: number; data?: string }[]
  >([]);
  const [count, setCount] = useState(9);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState<null | "URL" | "LIST">(null);

  function getInitialStages() {
    const filtersFromUrl = Object.entries(router.query).reduce(
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

    return Object.keys(filtersFromUrl).length
      ? filtersFromUrl
      : stages.reduce((acc: Record<string, RankedMode[]>, cur) => {
          acc[cur] = ["SZ", "TC", "RM", "CB"];
          return acc;
        }, {});
  }

  const poolForUrl = (stagesSelectedForUrl: Record<string, string[]>) => {
    return Object.entries(stagesSelectedForUrl).map(([key, stages]) => ({
      key,
      value: stages.join(","),
    }));
  };

  useEffect(() => {
    const maplist = localStorage.getItem("maplist");
    if (!maplist) return;
    setMaplist(maplist);
  }, []);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopied(null);
    }, 750);

    return () => clearTimeout(timer);
  }, [copied]);

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
    setManySearchParams(poolForUrl(newStagesSelected), true);
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
      SZ: shuffleArray(modeStages.SZ),
      TC: shuffleArray(modeStages.TC),
      RM: shuffleArray(modeStages.RM),
      CB: shuffleArray(modeStages.CB),
    };

    const modesFromGenerationMode =
      generationMode === "SZ_EVERY_OTHER"
        ? ["TC", "RM", "CB"]
        : generationMode === "EQUAL"
        ? ["SZ", "TC", "RM", "CB"]
        : transformModesToStringArray();

    const filteredModes = (modesFromGenerationMode as RankedMode[]).filter(
      (mode) => modeStages[mode].length > 0
    );
    const modes =
      generationMode === "CUSTOM_ORDER"
        ? filteredModes
        : shuffleArray(filteredModes);
    if (modes.length === 0) {
      return generationMode === "CUSTOM_ORDER"
        ? "I can't generate a maplist without any modes you know."
        : "I can't generate a maplist without any maps in it you know.";
    }
    const stagesAlreadyPicked = new Set<string>();

    const isSZFirst = false;

    return new Array(count)
      .fill(null)
      .map((_, i) => {
        let modeOfRound: RankedMode = "SZ";

        if (
          generationMode !== "SZ_EVERY_OTHER" ||
          i % 2 === Number(isSZFirst)
        ) {
          modeOfRound = modes[0];
          modes.push(modes.shift() as RankedMode);
        }

        const stageArray = modeStages[modeOfRound];

        stageArray.push(stageArray.shift() as string);

        let shifted = 0;
        while (
          stagesAlreadyPicked.has(stageArray[0]) &&
          shifted < stageArray.length
        ) {
          stageArray.push(stageArray.shift() as string);
          shifted++;
        }

        stagesAlreadyPicked.add(stageArray[0]);

        return `${i + 1}) ${modeOfRound} on ${stageArray[0]}`;
      })
      .join("\n");
  };

  return (
    <>
      <MyHead title={t`Maplist Generator`} />
      {editing ? (
        <>
          <Alert status="info" mb={8}>
            <AlertIcon />
            <Trans>
              Pro tip: bookmark this page after making your map list to save it
            </Trans>
          </Alert>
          <Grid
            templateColumns="2fr 2fr 1fr 1fr 1fr 1fr"
            rowGap={4}
            placeItems="center"
            mx={["-20px", "0"]}
          >
            <Box />
            <Box />
            <ModeImage mode="SZ" />
            <ModeImage mode="TC" />
            <ModeImage mode="RM" />
            <ModeImage mode="CB" />
            {stages.map((stage) => {
              const buttonIsAdd = (stagesSelected[stage]?.length ?? 0) < 4;
              return (
                <Fragment key={stage}>
                  <SubText textAlign="center">{i18n._(stage)}</SubText>

                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme={buttonIsAdd ? "theme" : "red"}
                    onClick={() => {
                      const newStagesSelected = {
                        ...stagesSelected,
                        [stage]: ["SZ", "TC", "RM", "CB"] as RankedMode[],
                      };

                      if (!buttonIsAdd) delete newStagesSelected[stage];

                      setStagesSelected(newStagesSelected);
                      setManySearchParams(poolForUrl(newStagesSelected), true);
                    }}
                  >
                    {buttonIsAdd ? <Trans>All</Trans> : <Trans>Clear</Trans>}
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
              );
            })}
          </Grid>
          <FormControl>
            <FormLabel htmlFor="share" mt={4}>
              <Trans>Share your map pool</Trans>
            </FormLabel>
            {window && (
              <InputGroup size="md" mb={8}>
                <Input name="share" value={window.location.href} readOnly />
                <InputRightElement width="4.5rem">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied("URL");
                    }}
                    h="1.75rem"
                    size="sm"
                    disabled={copied === "URL"}
                  >
                    {copied === "URL" ? <FiCheck /> : <Trans>Copy</Trans>}
                  </Button>
                </InputRightElement>
              </InputGroup>
            )}
          </FormControl>
        </>
      ) : (
        <Grid
          mb={8}
          templateColumns="repeat(4, 1fr)"
          rowGap={4}
          columnGap={4}
          display={["none", null, "grid"]}
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
                <SubText key={stage}>{stage}</SubText>
              ) : null
            )}
          </Box>
          <Box textAlign="center">
            {Object.entries(stagesSelected).map(([stage, modes]) =>
              modes.includes("TC") ? (
                <SubText key={stage}>{stage}</SubText>
              ) : null
            )}
          </Box>
          <Box textAlign="center">
            {Object.entries(stagesSelected).map(([stage, modes]) =>
              modes.includes("RM") ? (
                <SubText key={stage}>{stage}</SubText>
              ) : null
            )}
          </Box>
          <Box textAlign="center">
            {Object.entries(stagesSelected).map(([stage, modes]) =>
              modes.includes("CB") ? (
                <SubText key={stage}>{stage}</SubText>
              ) : null
            )}
          </Box>
        </Grid>
      )}
      <Stack direction={["column", "row"]} spacing={4} mb={4}>
        <Button
          leftIcon={<FiRotateCw />}
          onClick={() => {
            const maplist = generateMaps();
            setMaplist(maplist);
            localStorage.setItem("maplist", maplist);
          }}
        >
          <Trans>Generate maps</Trans>
        </Button>
        <Button
          leftIcon={<FiFilter />}
          variant="outline"
          onClick={() => setEditing(!editing)}
        >
          {editing ? <Trans>Hide maps</Trans> : <Trans>Change map pool</Trans>}
        </Button>
      </Stack>
      <RadioGroup
        onChange={(value) =>
          setGenerationMode(
            value as "EQUAL" | "SZ_EVERY_OTHER" | "CUSTOM_ORDER"
          )
        }
        value={generationMode}
      >
        <Stack direction="row" mb={4}>
          <Radio value="EQUAL">
            <Trans>All modes equally</Trans>
          </Radio>
          <Radio value="SZ_EVERY_OTHER">
            <Trans>SZ every other</Trans>
          </Radio>
          <Radio value="CUSTOM_ORDER">
            <Trans>Custom order</Trans>
          </Radio>
        </Stack>
      </RadioGroup>
      {generationMode === "CUSTOM_ORDER" && (
        <MultipleModeSelector
          options={[
            { label: "Splat Zones", value: "SZ", data: "SZ" },
            { label: "Tower Control", value: "TC", data: "TC" },
            { label: "Rainmaker", value: "RM", data: "RM" },
            { label: "Clam Blitz", value: "CB", data: "CB" },
          ]}
          isDisabled={generationMode !== "CUSTOM_ORDER"}
          setValue={getModeValues}
          width={"90%"}
        />
      )}
      <FormControl>
        <FormLabel htmlFor="count" fontSize="sm" mt={4}>
          <Trans>Amount of maps to generate</Trans>
        </FormLabel>
        <NumberInput
          name="count"
          size="sm"
          value={count}
          min={1}
          max={100}
          onChange={(_, value) => {
            if (!Number.isNaN(value)) setCount(value);
          }}
          mb={4}
          width={24}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      {maplist && (
        <>
          <Textarea value={maplist} readOnly rows={9} />
          <Button
            mt={2}
            variant="outline"
            size="sm"
            width={16}
            disabled={copied === "LIST"}
            onClick={() => {
              navigator.clipboard.writeText(maplist);
              setCopied("LIST");
            }}
          >
            {copied === "LIST" ? <FiCheck /> : <Trans>Copy</Trans>}
          </Button>
        </>
      )}
    </>
  );

  function getModeValues(
    value: { label: string; value: number; data?: string }[]
  ) {
    setModes(value);
  }

  function transformModesToStringArray() {
    return modes.map((mode) => {
      if (mode.data) return mode.data;
      else return "";
    });
  }
};

MapsGeneratorPage.header = (
  <HeaderBanner
    icon="plans"
    title="Maplist Generator"
    subtitle="Get a list of maps to play in a scrim"
  />
);

export default MapsGeneratorPage;
