import React from "react"
import { Button, Icon, Message } from "semantic-ui-react"
import { useQuery } from "@apollo/react-hooks"
import { Redirect } from "react-router-dom"

import { userLean } from "../../graphql/queries/userLean"
import Loading from "./Loading"
import Error from "./Error"

const PleaseLogIn = () => {
  const { data, error, loading } = useQuery(userLean)

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  if (data.user) return <Redirect to={`u/${data.user.discord_id}`} />
  return (
    <>
      <Message>Please log in to access this page</Message>
      <div style={{ textAlign: "center" }}>
        <Button as="a" href="/auth/discord" size="large" secondary>
          <Icon name="discord" size="large" />
          Log in via Discord
        </Button>
      </div>
    </>
  )
}

export default PleaseLogIn
