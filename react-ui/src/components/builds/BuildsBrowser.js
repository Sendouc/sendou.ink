import React from "react"
import { useQuery } from "@apollo/react-hooks"
import { useQueryParams, StringParam, NumberParam } from "use-query-params"
import WeaponDropdown from "../common/WeaponDropdown"
import { searchForBuildsByWeapon } from "../../graphql/queries/searchForBuildsByWeapon"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { Card, Header, Pagination, Icon } from "semantic-ui-react"
import BuildCard from "../common/BuildCard"
import WpnImage from "../common/WpnImage"

const BuildsBrowser = () => {
  const [query, setQuery] = useQueryParams({
    weapon: StringParam,
    page: NumberParam
  })
  const { page = 1, weapon } = query
  const { data, error, loading } = useQuery(searchForBuildsByWeapon, {
    variables: query
  })

  const weaponsList = () => {
    if (loading) return <Loading />
    if (error) return <Error errorMessage={error.message} />
    return (
      <>
        <Header as="h2">
          {weapon ? (
            <>
              <WpnImage weapon={weapon} /> {weapon} Builds
            </>
          ) : (
            <>Latest Builds</>
          )}
        </Header>
        <Pagination
          activePage={page}
          onPageChange={(e, { activePage }) => setQuery({ page: activePage })}
          totalPages={data.searchForBuildsByWeapon.pageCount}
          firstItem={null}
          lastItem={null}
          prevItem={{ content: <Icon name="angle left" />, icon: true }}
          nextItem={{ content: <Icon name="angle right" />, icon: true }}
        />
        <Card.Group style={{ marginTop: "1em" }}>
          {data.searchForBuildsByWeapon.builds.map(build => {
            return <BuildCard key={build.id} build={build} showWeapon={false} />
          })}
        </Card.Group>
        <Pagination
          style={{ marginTop: "1.5em" }}
          activePage={page}
          onPageChange={(e, { activePage }) => setQuery({ page: activePage })}
          totalPages={data.searchForBuildsByWeapon.pageCount}
          firstItem={null}
          lastItem={null}
          prevItem={{ content: <Icon name="angle left" />, icon: true }}
          nextItem={{ content: <Icon name="angle right" />, icon: true }}
        />
      </>
    )
  }

  return (
    <>
      <WeaponDropdown
        value={weapon}
        onChange={(e, { value }) => setQuery({ weapon: value, page: 1 })}
      />
      <div style={{ marginTop: "1em" }}>{weaponsList()}</div>
    </>
  )
}

export default BuildsBrowser
