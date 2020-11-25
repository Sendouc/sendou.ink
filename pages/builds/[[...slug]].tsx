import { Box, Flex } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import BuildCard from "components/builds/BuildCard";
import BuildFilters from "components/builds/BuildFilters";
import BuildsSkeleton from "components/builds/BuildsSkeleton";
import Breadcrumbs from "components/common/Breadcrumbs";
import MyInfiniteScroller from "components/common/MyInfiniteScroller";
import WeaponImage from "components/common/WeaponImage";
import WeaponSelector from "components/common/WeaponSelector";
import { useBuildsByWeapon } from "hooks/builds";
import { useMyTheme } from "lib/useMyTheme";

const BuildsPage = () => {
  const {
    data,
    isLoading,
    state,
    dispatch,
    hiddenBuildCount,
  } = useBuildsByWeapon();
  const { themeColorHex } = useMyTheme();
  return (
    <>
      <Breadcrumbs pages={[{ name: t`Builds` }]} />
      <WeaponSelector
        value={state.weapon}
        onChange={(weapon) => dispatch({ type: "SET_WEAPON", weapon })}
        excludeAlt
        isHeader
      />
      <>
        <Box mt={4} pr={3} mb="-5rem">
          {state.weapon ? (
            <WeaponImage name={state.weapon} size={128} />
          ) : (
            <Box w="135px" h="135px" />
          )}
        </Box>
        <Flex
          justifyContent="flex-end"
          p={2}
          mb={8}
          w="100%"
          bg={themeColorHex}
          rounded="lg"
          fontSize="sm"
          boxShadow="md"
          color="black"
        >
          <Flex justifyContent="space-between">
            <Box visibility={data.length === 0 ? "hidden" : undefined}>
              {data.length} <Trans>builds</Trans>{" "}
              {hiddenBuildCount > 0 && (
                <>
                  (+ {hiddenBuildCount} <Trans>hidden</Trans>)
                </>
              )}
            </Box>
          </Flex>
        </Flex>
      </>

      {state.weapon && (
        <BuildFilters filters={state.filters} dispatch={dispatch} />
      )}

      {isLoading && <BuildsSkeleton />}

      <MyInfiniteScroller>
        {data.flatMap((buildArray) =>
          state.expandedUsers.has(buildArray[0].userId) ? (
            buildArray.map((build) => (
              <BuildCard key={build.id} build={build} m={2} />
            ))
          ) : (
            <BuildCard
              key={buildArray[0].id}
              build={buildArray[0]}
              otherBuildCount={buildArray.length - 1}
              onShowAllByUser={() =>
                dispatch({ type: "EXPAND_USER", id: buildArray[0].userId })
              }
              m={2}
            />
          )
        )}
      </MyInfiniteScroller>
    </>
  );
};

export default BuildsPage;
