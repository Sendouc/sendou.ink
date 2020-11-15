import { Box, Wrap, WrapItem } from "@chakra-ui/core";
import { t } from "@lingui/macro";
import BuildCard from "components/builds/BuildCard";
import BuildFilters from "components/builds/BuildFilters";
import Breadcrumbs from "components/common/Breadcrumbs";
import WeaponSelector from "components/common/WeaponSelector";
import { useBuildsByWeapon } from "hooks/builds";

const BuildsPage = () => {
  const { data, state, dispatch } = useBuildsByWeapon();

  return (
    <>
      <Breadcrumbs pages={[{ name: t`Builds` }]} />
      <WeaponSelector
        value={state.weapon}
        onChange={(weapon) => dispatch({ type: "SET_WEAPON", weapon })}
        excludeAlt
        isHeader
      />
      <Box mt={10}>
        <BuildFilters filters={state.filters} dispatch={dispatch} />
      </Box>
      <Wrap pt={16} justifyContent="center" spacing={8}>
        {data.flatMap((buildArray) => {
          const firstBuild = buildArray[0];
          if (state.expandedUsers.has(firstBuild.userId)) {
            return buildArray.map((build) => (
              <WrapItem key={build.id}>
                <BuildCard build={build} />
              </WrapItem>
            ));
          }

          return (
            <WrapItem key={firstBuild.id}>
              <BuildCard
                build={firstBuild}
                otherBuildCount={buildArray.length - 1}
                onShowAllByUser={() =>
                  dispatch({ type: "EXPAND_USER", id: firstBuild.userId })
                }
              />
            </WrapItem>
          );
        })}
      </Wrap>
    </>
  );
};

export default BuildsPage;
