import React, { useState, useEffect } from "react"
import { summaries } from "../../graphql/queries/summaries"
import { useQuery } from "@apollo/react-hooks"
import Loading from "../common/Loading"
import { userLean } from "../../graphql/queries/userLean"
import { Redirect } from "react-router-dom"
import Error from "../common/Error"
import { Dropdown } from "semantic-ui-react"
import { months } from "../../utils/lists"
import SummaryLists from "./SummaryLists"

const VotingHistory = () => {
  const { data, loading, error } = useQuery(summaries)
  const [monthChoices, setMonthChoices] = useState([])
  const [forms, setForms] = useState({})
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery(userLean)

  useEffect(() => {
    if (
      loading ||
      error ||
      userQueryLoading ||
      userQueryError ||
      !data.summaries
    )
      return

    const monthsYears = data.summaries.reduce(
      (acc, cur) => {
        const { month, year } = cur
        if (!acc.contains[year]) acc.contains[year] = {}
        if (!acc.contains[year][month]) {
          acc.contains[year][month] = true
          const monthString = `${months[month]} ${year}`
          acc.monthChoices.push({
            key: monthString,
            text: monthString,
            value: monthString,
          })
        }
        return acc
      },
      { contains: {}, monthChoices: [] }
    ).monthChoices

    setForms({
      plus_server:
        userData.user.plus.membership_status === "ONE" ? "ONE" : "TWO",
      monthYear: monthsYears[0].value,
    })
    setMonthChoices(monthsYears)
  }, [data, loading, error, userQueryLoading, userQueryError, userData])

  if (!loading && !data.summaries) return <Redirect to="/access" />
  if (loading || userQueryLoading || monthChoices.length === 0)
    return <Loading />
  if (error) return <Error errorMessage={error.message} />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />
  if (!userData.user) return <Redirect to="/access" />

  const parts = forms.monthYear.split(" ")
  const month = months.indexOf(parts[0])
  const year = parseInt(parts[1])
  return (
    <>
      {userData.user.plus.membership_status === "ONE" && (
        <Dropdown
          selection
          value={forms.plus_server}
          onChange={(e, { value }) =>
            setForms({ ...forms, plus_server: value })
          }
          options={["ONE", "TWO"].map(plus_server => ({
            key: plus_server,
            text: plus_server === "ONE" ? "+1" : "+2",
            value: plus_server,
          }))}
          style={{ margin: "0 1em 1em 0" }}
        />
      )}
      <Dropdown
        selection
        value={forms.monthYear}
        onChange={(e, { value }) => setForms({ ...forms, monthYear: value })}
        options={monthChoices}
      />
      {
        <SummaryLists
          summaries={data.summaries.filter(
            summary =>
              summary.month === month &&
              summary.year === year &&
              summary.plus_server === forms.plus_server
          )}
        />
      }
    </>
  )
}

export default VotingHistory
