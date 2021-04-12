import { Flex, Select } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { RankedMode } from "@prisma/client";
import Top500Table from "app/xrank/components/Top500Table";
import ModeSelector from "components/common/ModeSelector";
import Page from "components/common/Page";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MyHead from "../../../components/common/MyHead";
import { Top500PlacementsByMonth } from "../service";

export interface XSearchPageProps {
  placements: Top500PlacementsByMonth;
  monthOptions: { label: string; value: string }[];
}

const XSearchPage = ({ placements, monthOptions }: XSearchPageProps) => {
  const [variables, setVariables] = useState<{
    month: number;
    year: number;
    mode: RankedMode;
  }>({
    month: Number(monthOptions[0].value.split(",")[0]),
    year: Number(monthOptions[0].value.split(",")[1]),
    mode: "SZ" as RankedMode,
  });

  const router = useRouter();

  useEffect(() => {
    router.replace(
      `/xsearch/${variables.year}/${variables.month}/${variables.mode}`
    );
  }, [variables]);

  //TODO: layout can be persistent between route changes
  return (
    <>
      <MyHead title={t`Top 500 Browser`} />
      <Page>
        <Flex flexDir={["column", null, "row"]} justify="space-between">
          <Select
            value={`${variables.month},${variables.year}`}
            onChange={(e) => {
              const [month, year] = e.target.value.split(",");

              setVariables({
                ...variables,
                month: Number(month),
                year: Number(year),
              });
            }}
            mb={4}
            maxW={64}
            size="sm"
            rounded="lg"
            mx={["auto", null, "0"]}
          >
            {monthOptions.map((monthYear) => (
              <option key={monthYear.value} value={monthYear.value}>
                {monthYear.label}
              </option>
            ))}
          </Select>
          <ModeSelector
            mode={variables.mode}
            setMode={(mode) => setVariables({ ...variables, mode })}
            mx={["auto", null, "0"]}
            mb={[4, null, 0]}
          />
        </Flex>
        <Top500Table placements={placements} />
      </Page>
    </>
  );
};

export default XSearchPage;
