import React, { useState, useContext } from "react"
import { useQuery } from "@apollo/react-hooks"
import { useQueryParams, StringParam, NumberParam } from "use-query-params"

import Loading from "../common/Loading"
import Error from "../common/Error"
import { SEARCH_FOR_PLACEMENTS } from "../../graphql/queries/searchForPlacements"
import WpnImage from "../common/WeaponImage"
import { months, modesShort } from "../../utils/lists"
import { RouteComponentProps } from "@reach/router"
import { Helmet } from "react-helmet-async"
import { Box, Flex, Icon } from "@chakra-ui/core"
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table"
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css"
import { ordinal_suffix_of } from "../../utils/helperFunctions"
import { Weapon } from "../../types"
import UserAvatar from "../common/UserAvatar"
import MyThemeContext from "../../themeContext"
import useBreakPoints from "../../hooks/useBreakPoints"
import "./Top500BrowserPage.css"
import Pagination from "../common/Pagination"
import Top500Forms from "./Top500Forms"
import PageHeader from "../common/PageHeader"
import Button from "../elements/Button"
import Alert from "../elements/Alert"

interface Placement {
  id: string
  mode: number
  name: string
  player?: {
    twitter: string
  }
  rank: number
  unique_id: string
  weapon: string
  x_power: number
  month: number
  year: number
}

interface SearchForPlacementsData {
  searchForPlacements: {
    placements: Placement[]
    pageCount: number
  }
}

interface SearchForPlacementsVars {
  page?: number
  name?: string
  weapon?: string
  mode?: number
  unique_id?: string
  month?: number
  year?: number
}

const Top500BrowserPage: React.FC<RouteComponentProps> = () => {
  const { themeColorWithShade } = useContext(MyThemeContext)
  const isSmall = useBreakPoints(640)
  const [query, setQuery] = useQueryParams({
    page: NumberParam,
    name: StringParam,
    weapon: StringParam,
    mode: NumberParam,
    unique_id: StringParam,
    month: NumberParam,
    year: NumberParam,
  })
  const [forms, setForms] = useState<SearchForPlacementsVars>({
    page: query.page ?? 1,
    name: query.name,
    weapon: query.weapon,
    mode: query.mode,
    unique_id: query.unique_id,
    month: query.month,
    year: query.year,
  })

  const { data, error, loading } = useQuery<
    SearchForPlacementsData,
    SearchForPlacementsVars
  >(SEARCH_FOR_PLACEMENTS, {
    variables: query,
  })

  const handleClear = () => {
    setForms({ page: 1 })
    setQuery({ page: 1 }, "replace")
  }

  const handleFormChange = (value: Object) => {
    setForms({ ...forms, ...value })
  }

  if (error) return <Error errorMessage={error.message} />
  if (loading && !data) return <Loading />

  const placements = data ? data.searchForPlacements.placements : []

  return (
    <>
      <Helmet>
        <title>Top 500 Browser | sendou.ink</title>
      </Helmet>
      <PageHeader title="X Rank Browser" />
      <Box>
        <Top500Forms forms={forms} handleChange={handleFormChange} />
        {forms.unique_id && (
          <Alert status="info">
            Viewing placements by player with the id {forms.unique_id}
          </Alert>
        )}
        <Flex mt="1em">
          <Button
            onClick={() => {
              setQuery({ ...forms, page: 1 })
              setForms({ ...forms, page: 1 })
            }}
          >
            Apply
          </Button>
          <Box mx="1em">
            <Button outlined onClick={handleClear}>
              Clear filters
            </Button>
          </Box>
        </Flex>
      </Box>
      <Box mt="1em">
        <Pagination
          currentPage={forms.page ?? 1}
          pageCount={data?.searchForPlacements.pageCount ?? 999}
          onChange={(page) => {
            setForms({ ...forms, page })
            setQuery({ ...query, page })
          }}
        />
      </Box>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Box textAlign="center">
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Weapon</Th>
                  <Th>X Power</Th>
                  <Th>Placement</Th>
                  <Th>Mode</Th>
                  <Th>Month</Th>
                  <Th>Year</Th>
                </Tr>
              </Thead>
              <Tbody>
                {placements.map((placement) => (
                  <Tr key={placement.id}>
                    <Td>
                      <Flex
                        alignItems="center"
                        cursor="pointer"
                        onClick={() => {
                          setForms({ unique_id: placement.unique_id, page: 1 })
                          setQuery(
                            { unique_id: placement.unique_id, page: 1 },
                            "replace"
                          )
                        }}
                      >
                        {placement.player?.twitter && (
                          <UserAvatar
                            name={placement.name}
                            twitterName={placement.player.twitter}
                            size="xs"
                          />
                        )}
                        <Box
                          as="span"
                          ml={placement.player?.twitter ? "0.5em" : undefined}
                        >
                          {placement.name}
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <Flex alignItems="center">
                        <Box
                          ml={isSmall ? undefined : "auto"}
                          mr={isSmall ? undefined : "auto"}
                        >
                          <WpnImage
                            englishName={placement.weapon as Weapon}
                            size="SMALL"
                          />
                        </Box>
                      </Flex>
                    </Td>
                    <Td>{placement.x_power}</Td>
                    <Td>
                      {placement.rank}
                      {ordinal_suffix_of(placement.rank)}
                    </Td>
                    <Td>
                      <Icon
                        name={modesShort[placement.mode] as any}
                        color={themeColorWithShade}
                        size="2em"
                      />
                    </Td>
                    <Td>{months[placement.month]}</Td>
                    <Td>{placement.year}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Box mt="1em">
            <Pagination
              currentPage={forms.page ?? 1}
              pageCount={data?.searchForPlacements.pageCount ?? 999}
              onChange={(page) => {
                setForms({ ...forms, page })
                setQuery({ ...query, page })
              }}
            />
          </Box>
        </>
      )}
    </>
  )
}

export default Top500BrowserPage
