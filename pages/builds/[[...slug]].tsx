import { Box, Button, Flex } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import APStats from "components/builds/APStats";
import BuildCard from "components/builds/BuildCard";
import BuildFilters from "components/builds/BuildFilters";
import BuildsSkeleton from "components/builds/BuildsSkeleton";
import MyInfiniteScroller from "components/common/MyInfiniteScroller";
import MyLink from "components/common/MyLink";
import WeaponImage from "components/common/WeaponImage";
import WeaponSelector from "components/common/WeaponSelector";
import HeaderBanner from "components/layout/HeaderBanner";
import { useBuildsByWeapon } from "hooks/builds";
import { useMyTheme, useUser } from "hooks/common";
import { useState } from "react";
import { RiBarChart2Fill, RiTShirtLine } from "react-icons/ri";
import MyHead from "../../components/common/MyHead";

const BuildsPage = () => {
  const {
    data,
    stats,
    isLoading,
    state,
    dispatch,
    hiddenBuildCount,
  } = useBuildsByWeapon();
  const [user] = useUser();
  const { secondaryBgColor, themeColorShade } = useMyTheme();
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <MyHead title={t`Builds`} />
      <Box mb={4} maxW={80} mx="auto">
        <WeaponSelector
          value={state.weapon}
          setValue={(weapon) => dispatch({ type: "SET_WEAPON", weapon })}
          menuIsOpen={!state.weapon}
          autoFocus
          isMulti={false}
        />
      </Box>
      {state.weapon && (
        <>
          <Flex justify="space-between" mt={6}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RiBarChart2Fill />}
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? (
                <Trans>Hide Stats</Trans>
              ) : (
                <Trans>Show Stats</Trans>
              )}
            </Button>
            {user && (
              <MyLink href={`/u/${user.discordId}?build=${state.weapon}`}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<RiTShirtLine />}
                  onClick={() => setShowStats(false)}
                >
                  <Trans>Add build</Trans>
                </Button>
              </MyLink>
            )}
          </Flex>
          <Box mt={4} pr={3} mb="-5rem">
            <WeaponImage name={state.weapon} size={128} />
          </Box>
          <Flex
            justifyContent="flex-end"
            p={2}
            mb={6}
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

      {state.weapon && (
        <BuildFilters filters={state.filters} dispatch={dispatch} />
      )}

      {showStats && <APStats stats={stats} />}

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

BuildsPage.header = (
  <HeaderBanner
    icon="builds"
    title="Builds"
    subtitle="Find what people are running on that weapon you picked up"
  />
);

export default BuildsPage;
