import React, { useState, useEffect } from "react"
import { useQuery } from "@apollo/react-hooks"
import { Link } from "react-router-dom"
import { useQueryParams, StringParam, NumberParam } from "use-query-params"

import Loading from "../common/Loading"
import Error from "../common/Error"
import { searchForPlacements } from "../../graphql/queries/searchForPlacements"
import Top500Forms from "./Top500Forms"
import {
  Button,
  Table,
  Image,
  Header,
  Pagination,
  Icon,
} from "semantic-ui-react"
import WpnImage from "../common/WpnImage"
import { modeIcons } from "../../assets/imageImports"
import { months } from "../../utils/lists"

const Top500Browser = ({ setMenuSelection }) => {
  const [showForms, setShowForms] = useState(false)
  const [query, setQuery] = useQueryParams({
    page: NumberParam,
    name: StringParam,
    weapon: StringParam,
    mode: NumberParam,
    unique_id: StringParam,
    month: NumberParam,
    year: NumberParam,
  })
  const [forms, setForms] = useState({
    page: 1,
    name: "",
    weapon: "",
    mode: 0,
    unique_id: "",
    month: "",
    year: "",
  })

  const { data, error, loading } = useQuery(searchForPlacements, {
    variables: query,
  })

  const handleClear = () => {
    setForms({
      page: 1,
      name: "",
      weapon: "",
      mode: 0,
      unique_id: "",
      month: "",
      year: "",
    })
  }

  useEffect(() => {
    document.title = "Top 500 Browser - sendou.ink"
  }, [])

  if (error) return <Error errorMessage={error.message} />
  if (loading && !data) return <Loading />

  return (
    <>
      <Button onClick={() => setShowForms(!showForms)}>
        {showForms ? "Hide forms" : "Show filter"}
      </Button>
      {showForms && (
        <div style={{ marginTop: "1em" }}>
          <Top500Forms
            forms={forms}
            setForms={setForms}
            onSubmit={() => setQuery(forms)}
            onClear={handleClear}
          />
        </div>
      )}
      <div style={{ margin: "1em 0 1em 0" }}>
        <Pagination
          activePage={forms.page}
          onPageChange={(e, { activePage }) => {
            setForms({ ...forms, page: activePage })
            setQuery({ ...query, page: activePage })
          }}
          totalPages={data.searchForPlacements.pageCount}
          firstItem={null}
          lastItem={null}
          prevItem={{ content: <Icon name="angle left" />, icon: true }}
          nextItem={{ content: <Icon name="angle right" />, icon: true }}
        />
      </div>
      <Table celled padded>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Weapon</Table.HeaderCell>
            <Table.HeaderCell>X Power</Table.HeaderCell>
            <Table.HeaderCell>Placement</Table.HeaderCell>
            <Table.HeaderCell>Mode</Table.HeaderCell>
            <Table.HeaderCell>Month</Table.HeaderCell>
            <Table.HeaderCell>Year</Table.HeaderCell>
            <Table.HeaderCell>ID</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.searchForPlacements.placements.map(placement => {
            return (
              <Table.Row key={placement.id}>
                <Table.Cell>
                  {placement.player.twitter ? (
                    <>
                      <Image
                        src={`https://avatars.io/twitter/${placement.player.twitter}`}
                        avatar
                      />
                      <span>
                        <Link to={`/xsearch/p/${placement.unique_id}`}>
                          {placement.name}
                        </Link>
                      </span>
                    </>
                  ) : (
                    <Link to={`/xsearch/p/${placement.unique_id}`}>
                      {placement.name}
                    </Link>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <WpnImage weapon={placement.weapon} size="SMALL" />
                </Table.Cell>
                <Table.Cell>
                  <Header as="h4">{placement.x_power}</Header>
                </Table.Cell>
                <Table.Cell>
                  <Header as="h2">{placement.rank}</Header>
                </Table.Cell>
                <Table.Cell>
                  <Image src={modeIcons[placement.mode]} size="mini" />
                </Table.Cell>
                <Table.Cell>{months[placement.month]}</Table.Cell>
                <Table.Cell>{placement.year}</Table.Cell>
                <Table.Cell>{placement.unique_id}</Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      <div style={{ margin: "1em 0 1em 0" }}>
        <Pagination
          activePage={forms.page}
          onPageChange={(e, { activePage }) => {
            setForms({ ...forms, page: activePage })
            setQuery({ ...query, page: activePage })
            window.scrollTo(0, 0)
          }}
          totalPages={data.searchForPlacements.pageCount}
          firstItem={null}
          lastItem={null}
          prevItem={{ content: <Icon name="angle left" />, icon: true }}
          nextItem={{ content: <Icon name="angle right" />, icon: true }}
        />
      </div>
    </>
  )
}

export default Top500Browser
