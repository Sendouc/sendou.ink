import React, { useState } from "react"
import { useQuery } from "@apollo/react-hooks"
import { Search } from "semantic-ui-react"

import { users } from "../../graphql/queries/users"
import Error from "./Error"

const RESULTS_TO_SHOW = 10

const UserSearch = ({ setSelection }) => {
  const { data, error, loading } = useQuery(users)
  const [value, setValue] = useState("")

  if (loading) return <Search loading />
  if (error) return <Error errorMessage={error.message} />

  let filteredArray = data.users.filter(user => {
    const valueUpper = value.toUpperCase()
    const username = `${user.username.toUpperCase()}#${user.twitter_name}`
    const twitter = user.twitter_name ? user.twitter_name.toUpperCase() : ""
    const discord_id = user.discord_id
    return (
      username.indexOf(valueUpper) !== -1 ||
      twitter.indexOf(valueUpper) !== -1 ||
      discord_id.indexOf(valueUpper) !== -1
    )
  })

  if (filteredArray.length <= RESULTS_TO_SHOW) {
    filteredArray = filteredArray.map(user => ({
      title: `${user.username}#${user.discriminator}`,
      description: user.twitter_name && `@${user.twitter_name}`,
      image:
        user.twitter_name && `https://avatars.io/twitter/${user.twitter_name}`,
      id: user.discord_id,
    }))
  } else {
    filteredArray = []
  }

  return (
    <Search
      value={value}
      onSearchChange={(e, { value }) => setValue(value)}
      onResultSelect={(e, { result }) => setSelection(result)}
      results={filteredArray}
      open={filteredArray.length <= RESULTS_TO_SHOW}
      showNoResults={false}
    />
  )
}

export default UserSearch
