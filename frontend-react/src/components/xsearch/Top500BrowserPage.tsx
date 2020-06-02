import { useQuery } from "@apollo/react-hooks"
import { Badge, Box, Flex, Icon } from "@chakra-ui/core"
import { Link, RouteComponentProps } from "@reach/router"
import React, { useContext, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css"
import { NumberParam, StringParam, useQueryParams } from "use-query-params"
import {
  SearchForPlacementsData,
  SearchForPlacementsVars,
  SEARCH_FOR_PLACEMENTS,
} from "../../graphql/queries/searchForPlacements"
import useBreakPoints from "../../hooks/useBreakPoints"
import MyThemeContext from "../../themeContext"
import { Weapon } from "../../types"
import { ordinal_suffix_of } from "../../utils/helperFunctions"
import { modesShort, months } from "../../utils/lists"
import Error from "../common/Error"
import Loading from "../common/Loading"
import PageHeader from "../common/PageHeader"
import Pagination from "../common/Pagination"
import WpnImage from "../common/WeaponImage"
import Alert from "../elements/Alert"
import Button from "../elements/Button"
import "./Top500BrowserPage.css"
import Top500Forms from "./Top500Forms"

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
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {placements.map((placement) => (
                  <Tr key={placement.id}>
                    <Td>
                      <Flex
                        alignItems="center"
                        cursor={
                          placement.player?.discord_id ? "pointer" : undefined
                        }
                      >
                        <Box
                          as="span"
                          color={
                            placement.player?.discord_id
                              ? themeColorWithShade
                              : undefined
                          }
                        >
                          {placement.player?.discord_id ? (
                            <Link to={`/u/${placement.player.discord_id}`}>
                              {placement.name}
                            </Link>
                          ) : (
                            <>{placement.name}</>
                          )}
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
                    <Td>
                      <Badge
                        cursor="pointer"
                        onClick={() => {
                          setForms({ unique_id: placement.unique_id, page: 1 })
                          setQuery(
                            { unique_id: placement.unique_id, page: 1 },
                            "replace"
                          )
                        }}
                      >
                        ID
                      </Badge>
                    </Td>
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
