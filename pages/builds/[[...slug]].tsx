import { Box, Flex } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import BuildCard from "components/builds/BuildCard";
import BuildFilters from "components/builds/BuildFilters";
import Breadcrumbs from "components/common/Breadcrumbs";
import MyInfiniteScroller from "components/common/MyInfiniteScroller";
import WeaponImage from "components/common/WeaponImage";
import WeaponSelector from "components/common/WeaponSelector";
import { useBuildsByWeapon } from "hooks/builds";

const BuildsPage = () => {
  const { data, state, dispatch, hiddenBuildCount } = useBuildsByWeapon();
  return (
    <>
      <Breadcrumbs pages={[{ name: t`Builds` }]} />
      <WeaponSelector
        value={state.weapon}
        onChange={(weapon) => dispatch({ type: "SET_WEAPON", weapon })}
        excludeAlt
        isHeader
      />
      {state.weapon && (data.length > 0 || hiddenBuildCount > 0) && (
        <>
          <Box mt={4} pr={3} mb="-5rem">
            <WeaponImage name={state.weapon} size={128} />
          </Box>
          <Flex
            justifyContent="flex-end"
            p={2}
            mb={8}
            w="100%"
            bg="linear-gradient(to right, #43c6ac, #f8ffae);"
            rounded="lg"
            fontSize="sm"
            boxShadow="md"
            color="black"
          >
            <Flex justifyContent="space-between">
              <Box>
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
      )}
      {state.weapon && (
        <BuildFilters filters={state.filters} dispatch={dispatch} />
      )}

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
