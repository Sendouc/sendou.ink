import React, { useState, useEffect } from "react"
import { SUMMARIES } from "../../graphql/queries/summaries"
import { useQuery } from "@apollo/react-hooks"
import Loading from "../common/Loading"
import { USER } from "../../graphql/queries/user"
import Error from "../common/Error"
import { months } from "../../utils/lists"
import { Redirect, RouteComponentProps, Link } from "@reach/router"
import { UserData } from "../../types"
import { Flex, Box } from "@chakra-ui/core"
import Select from "../elements/Select"
import Summaries from "./Summaries"
import PageHeader from "../common/PageHeader"
import { Helmet } from "react-helmet-async"
import { FaLongArrowAltLeft } from "react-icons/fa"
import Button from "../elements/Button"

export interface Summary {
  discord_user: {
    discord_id: string
    username: string
    discriminator: string
    twitter_name: string
  }
  score: {
    total: number
    eu_count?: number[]
    na_count?: number[]
  }
  plus_server: "ONE" | "TWO"
  suggested: boolean
  vouched: boolean
  year: number
  month: number
}

interface SummariesData {
  summaries: Summary[]
}

const VotingHistoryPage: React.FC<RouteComponentProps> = () => {
  const { data, loading, error } = useQuery<SummariesData>(SUMMARIES)
  const [monthChoices, setMonthChoices] = useState<string[]>([])
  const [forms, setForms] = useState<
    Partial<{ plus_server: "+1" | "+2"; monthYear: string }>
  >({})
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery<UserData>(USER)

  useEffect(() => {
    if (
      loading ||
      error ||
      userQueryLoading ||
      userQueryError ||
      !data ||
      !data.summaries ||
      !userData ||
      !userData.user ||
      !userData.user.plus
    )
      return

    const monthsYears: string[] = data.summaries.reduce(
      (
        acc: {
          contains: { [key: number]: { [key: number]: boolean } }
          monthChoices: string[]
        },
        cur: Summary
      ) => {
        const { month, year } = cur
        if (!acc.contains[year]) acc.contains[year] = {}
        if (!acc.contains[year][month]) {
          acc.contains[year][month] = true
          const monthString = `${months[month]} ${year}`
          acc.monthChoices.push(monthString)
        }
        return acc
      },
      { contains: {}, monthChoices: [] }
    ).monthChoices

    setForms({
      plus_server:
        userData!.user.plus.membership_status === "ONE" ? "+1" : "+2",
      monthYear: monthsYears[0],
    })
    setMonthChoices(monthsYears)
  }, [data, loading, error, userQueryLoading, userQueryError, userData])

  if (!loading && data && !data.summaries) return <Redirect to="/404" />
  if (error) return <Error errorMessage={error.message} />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />
  if (
    loading ||
    userQueryLoading ||
    monthChoices.length === 0 ||
    !data ||
    !userData ||
    !userData.user ||
    !userData.user.plus
  )
    return <Loading />
  if (userData && !userData.user) return <Redirect to="/access" />

  const parts = forms.monthYear!.split(" ")
  const month = months.indexOf(parts[0] as any)
  const year = parseInt(parts[1])
  return (
    <>
      <Helmet>
        <title>Plus Server Voting History | sendou.ink</title>
      </Helmet>
      <PageHeader title="Voting History" />
      <Link to="/plus">
        <Button outlined icon={FaLongArrowAltLeft}>
          Back to actions page
        </Button>
      </Link>
      <Flex flexWrap="wrap" justifyContent="center" mt="1em">
        {userData.user.plus.membership_status === "ONE" && (
          <Box m="0.5em" minW="250px">
            <Select
              label=""
              options={[
                { label: "+1", value: "+1" },
                { label: "+2", value: "+2" },
              ]}
              value={forms.plus_server}
              setValue={value => setForms({ ...forms, plus_server: value })}
            />
          </Box>
        )}
        <Box m="0.5em" minW="250px">
          <Select
            label=""
            options={monthChoices.map(my => ({ label: my, value: my }))}
            value={forms.monthYear}
            setValue={value => setForms({ ...forms, monthYear: value })}
          />
        </Box>
      </Flex>
      <Summaries
        summaries={data.summaries!.filter(summary => {
          const server = summary.plus_server === "ONE" ? "+1" : "+2"
          return (
            summary.month === month &&
            summary.year === year &&
            server === forms.plus_server
          )
        })}
      />
    </>
  )
}

export default VotingHistoryPage
