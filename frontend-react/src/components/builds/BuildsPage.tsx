import { useQuery } from "@apollo/client"
import { Box, Button, Flex, FormLabel, Heading, Switch } from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import useLocalStorage from "@rehooks/local-storage"
import React, { useContext, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import InfiniteScroll from "react-infinite-scroller"
import { SEARCH_FOR_BUILDS } from "../../graphql/queries/searchForBuilds"
import MyThemeContext from "../../themeContext"
import {
  Ability,
  Build,
  SearchForBuildsData,
  SearchForBuildsVars,
  Weapon
} from "../../types"
import Error from "../common/Error"
import Loading from "../common/Loading"
import PageHeader from "../common/PageHeader"
import WeaponSelector from "../common/WeaponSelector"
import Alert from "../elements/Alert"
import AbilitySelector from "./AbilitySelector"
import BuildCard from "./BuildCard"

const BuildsPage: React.FC<RouteComponentProps> = () => {
  const { themeColor } = useContext(MyThemeContext)
  const { t } = useTranslation()
  const [weapon, setWeapon] = useState<Weapon | null>(null)
  const [buildsToShow, setBuildsToShow] = useState(10)
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [prefersAPView, setAPPreference] = useLocalStorage<boolean>(
    "prefersAPView"
  )

  const { data, error, loading } = useQuery<
    SearchForBuildsData,
    SearchForBuildsVars
  >(SEARCH_FOR_BUILDS, {
    variables: { weapon: weapon as any },
    skip: !weapon,
  })
  if (error) return <Error errorMessage={error.message} />

  const buildsFilterByAbilities: Build[] = !data
    ? []
    : abilities.length > 0
    ? data.searchForBuilds.filter((build) => {
        const abilitiesInBuild = new Set([
          ...build.headgear,
          ...build.clothing,
          ...build.shoes,
        ])
        return abilities.every((ability) =>
          abilitiesInBuild.has(ability as any)
        )
      })
    : data.searchForBuilds

  const usersOtherBuilds: { [key: string]: Build[] } = {}

  const buildsOnePerUserUnlessExpanded = buildsFilterByAbilities.reduce(
    (buildsArray: Build[], build) => {
      const discord_id = build.discord_user!.discord_id
      if (!usersOtherBuilds[discord_id]) {
        usersOtherBuilds[discord_id] = []
        return [...buildsArray, build]
      }

      usersOtherBuilds[discord_id] = [...usersOtherBuilds[discord_id], build]
      return buildsArray
    },
    []
  )

  return (
    <>
      <Helmet>
        <title>
          {t("navigation;Builds")} {weapon ? `- ${t(`game;${weapon}`)}` : ""} -
          sendou.ink
        </title>
      </Helmet>
      <PageHeader title={t("navigation;Builds")} />
      <FormLabel htmlFor="apview">
        {t("builds;Default to Ability Point view")}
      </FormLabel>
      <Switch
        id="apview"
        color={themeColor}
        isChecked={prefersAPView === null ? false : prefersAPView}
        onChange={() => setAPPreference(!prefersAPView)}
      />
      <Box my={6} maxW="24rem">
        <WeaponSelector
          label={t("builds;Select a weapon to start viewing builds")}
          value={weapon}
          setValue={(weapon: string) => setWeapon(weapon as Weapon)}
          autoFocus
          menuIsOpen={!weapon}
        />
      </Box>
      {weapon && (
        <Box mt="1em">
          <AbilitySelector abilities={abilities} setAbilities={setAbilities} />
        </Box>
      )}
      {loading && <Loading />}
      {buildsFilterByAbilities.length > 0 && data && (
        <>
          <InfiniteScroll
            pageStart={1}
            loadMore={(page) => setBuildsToShow(page * 10)}
            hasMore={buildsToShow < data.searchForBuilds.length}
          >
            <Flex flexWrap="wrap" pt="2em">
              {buildsOnePerUserUnlessExpanded
                .filter((_, index) => index < buildsToShow)
                .reduce((buildElementsArray: JSX.Element[], build) => {
                  const allBuildsByUserToShow = []
                  allBuildsByUserToShow.push(
                    <BuildCard
                      key={build.id}
                      build={build}
                      defaultToAPView={
                        prefersAPView === null ? false : prefersAPView
                      }
                      showUser
                      otherBuildCount={
                        usersOtherBuilds[build.discord_user!.discord_id]
                          .length &&
                        !expandedUsers.has(build.discord_user!.discord_id)
                          ? usersOtherBuilds[build.discord_user!.discord_id]
                              .length + 1
                          : undefined
                      }
                      onShowAllByUser={() =>
                        setExpandedUsers(
                          new Set(
                            expandedUsers.add(build.discord_user!.discord_id)
                          )
                        )
                      }
                      m="0.5em"
                    />
                  )

                  if (expandedUsers.has(build.discord_user!.discord_id)) {
                    allBuildsByUserToShow.push(
                      ...usersOtherBuilds[
                        build.discord_user!.discord_id
                      ].map((build) => (
                        <BuildCard
                          key={build.id}
                          build={build}
                          defaultToAPView={
                            prefersAPView === null ? false : prefersAPView
                          }
                          showUser
                          m="0.5em"
                        />
                      ))
                    )
                  }

                  return [...buildElementsArray, ...allBuildsByUserToShow]
                }, [])}
            </Flex>
          </InfiniteScroll>
          <Box w="50%" textAlign="center" mx="auto" mt="1em">
            <Heading size="sm" fontFamily="rubik">
              {t("builds;No more builds to show")}
            </Heading>
            <Button
              colorScheme={themeColor}
              variant="outline"
              mt="1em"
              onClick={() => window.scrollTo(0, 0)}
            >
              {t("builds;Return to the top")}
            </Button>
          </Box>
        </>
      )}
      {weapon && buildsFilterByAbilities.length === 0 && !loading && (
        <Alert status="info">
          {t("builds;No builds found with the current filter")}
        </Alert>
      )}
    </>
  )
}

export default BuildsPage
