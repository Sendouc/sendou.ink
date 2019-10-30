import { useState, useEffect } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { useLazyQuery } from "@apollo/react-hooks"

function useSearchForms(query, initialFilter = {}) {
  const [filter, setFilter] = useState(initialFilter)
  const [filterForSearch, setFilterForSearch] = useState({})
  const location = useLocation()
  const history = useHistory()
  const [getData, { data, error, loading }] = useLazyQuery(query, {
    variables: filterForSearch
  })

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const filterFromParams = {}
    for (let [key, value] of searchParams) {
      // this could be a bad solution but for now good enough
      if (value.indexOf(",") !== -1) value = value.split(",")
      else if (key === "comp") value = [value]

      if (!isNaN(value)) {
        filterFromParams[key] = parseInt(value)
      } else if (filter.hasOwnProperty(key)) {
        filterFromParams[key] = value
      }
    }
    setFilter({ ...filter, ...filterFromParams })
    setFilterForSearch({ ...filter, ...filterFromParams })
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams()
    for (const key in filterForSearch) {
      if (
        filterForSearch.hasOwnProperty(key) &&
        filterForSearch[key] &&
        filterForSearch[key].toString().length > 0
      ) {
        searchParams.set(key, filterForSearch[key])
      }
    }
    searchParams.sort()
    history.push(location.pathname + "?" + searchParams.toString())
  }, [filterForSearch, history, location.pathname])

  //changesBeforeFiring can be provided instead of setting the filter separately
  //to keep things in sync
  const fireQuery = (changesBeforeFiring = {}) => {
    const filterForQuery = { ...filter, ...changesBeforeFiring }
    setFilterForSearch(filterForQuery)
    setFilter(filterForQuery)
  }

  return { data, error, loading, filter, setFilter, fireQuery }
}

export default useSearchForms
