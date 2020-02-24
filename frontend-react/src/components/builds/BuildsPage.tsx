import React from "react"
import { Helmet } from "react-helmet-async"
import { RouteComponentProps } from "@reach/router"
import WeaponSelector from "../common/WeaponSelector"
import { useState } from "react"
import {
  Weapon,
  Ability,
  SearchForBuildsData,
  SearchForBuildsVars,
  Build,
} from "../../types"
import { Box, Flex, Heading, FormLabel, Switch, Button } from "@chakra-ui/core"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import useLocalStorage from "@rehooks/local-storage"
import { useQuery } from "@apollo/react-hooks"
import { SEARCH_FOR_BUILDS } from "../../graphql/queries/searchForBuilds"
import Loading from "../common/Loading"
import Error from "../common/Error"
import BuildCard from "./BuildCard"
import InfiniteScroll from "react-infinite-scroller"
import PageHeader from "../common/PageHeader"
import AbilitySelector from "./AbilitySelector"
import Alert from "../elements/Alert"

const BuildsPage: React.FC<RouteComponentProps> = () => {
  const { themeColor } = useContext(MyThemeContext)
  const [weapon, setWeapon] = useState<Weapon | null>(null)
  const [buildsToShow, setBuildsToShow] = useState(10)
  const [abilities, setAbilities] = useState<Ability[]>([])
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
    : data.searchForBuilds.filter(build => {
        if (abilities.length === 0) return true
        const abilitiesInBuild = new Set([
          ...build.headgear,
          ...build.clothing,
          ...build.shoes,
        ])
        return abilities.every(ability => abilitiesInBuild.has(ability as any))
      })

  return (
    <>
      <Helmet>
        <title>{weapon ? `${weapon} ` : ""}Builds | sendou.ink</title>
      </Helmet>
      <PageHeader title="Builds" />
      <FormLabel htmlFor="apview">Default to Ability Point view</FormLabel>
      <Switch
        id="apview"
        color={themeColor}
        isChecked={prefersAPView === null ? false : prefersAPView}
        onChange={() => setAPPreference(!prefersAPView)}
      />
      <Box mt="1em">
        <WeaponSelector
          label="Select a weapon to start viewing builds"
          setValue={(weapon: string) => setWeapon(weapon as Weapon)}
          autoFocus
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
            loadMore={page => setBuildsToShow(page * 10)}
            hasMore={buildsToShow < data.searchForBuilds.length}
          >
            <Flex flexWrap="wrap" pt="2em" justifyContent="center">
              {buildsFilterByAbilities
                .filter((build, index) => index < buildsToShow)
                .map(build => (
                  <BuildCard
                    key={build.id}
                    build={build}
                    defaultToAPView={
                      prefersAPView === null ? false : prefersAPView
                    }
                    showUser
                    m="0.5em"
                  />
                ))}
            </Flex>
          </InfiniteScroll>
          <Box w="50%" textAlign="center" mx="auto" mt="1em">
            <Heading size="sm">No more builds to show</Heading>
            <Button
              variantColor={themeColor}
              variant="outline"
              mt="1em"
              onClick={() => window.scrollTo(0, 0)}
            >
              Return to the top
            </Button>
          </Box>
        </>
      )}
      {weapon && buildsFilterByAbilities.length === 0 && !loading && (
        <Alert status="info">No builds found with the current filter</Alert>
      )}
    </>
  )
}

export default BuildsPage
