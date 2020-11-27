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

// TODO: button to add new build

const BuildsPage = () => {
  const {
    data,
    isLoading,
    state,
    dispatch,
    hiddenBuildCount,
  } = useBuildsByWeapon();
  const { secondaryBgColor, themeColorShade } = useMyTheme();
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
        {state.weapon && (
          <>
            <Box mt={4} pr={3} mb="-5rem">
              <WeaponImage name={state.weapon} size={128} />
            </Box>
            <Flex
              justifyContent="flex-end"
              p={2}
              mb={8}
              w="100%"
              bg={secondaryBgColor}
              rounded="lg"
              fontSize="sm"
              boxShadow="md"
            >
              <Flex
                justifyContent="space-between"
                fontSize="xs"
                textColor="black"
                textTransform="uppercase"
                letterSpacing="wider"
                lineHeight="1rem"
                fontWeight="medium"
              >
                <Box
                  visibility={
                    data.length === 0 && hiddenBuildCount === 0
                      ? "hidden"
                      : undefined
                  }
                  color={themeColorShade}
                >
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
